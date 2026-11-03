import { useCallback, useEffect, useRef, useState } from "react";
import { WLED_URLS } from "app/config";
import { announce, playCue } from "app/utils/pomo-sounds";
import {
  DISPLAY_MODES,
  DisplayMode,
  Phase,
  Session,
  SessionConfig,
  decodeSession,
  durationOf,
  encodeSession,
  isExpired,
  nextPhase,
  remainingOf,
  restartPhase as restartAt,
  sameSession,
  scrub as scrubAt,
  sessionAt,
  startSession as startAt,
  togglePause as togglePauseAt,
} from "app/utils/pomo-session";
import {
  BLUE,
  MockWledClient,
  RED,
  WHITE,
  WledClient,
  WledJson,
  claimPayload,
  isLeftoverFrame,
  isPomoState,
  progressPayload,
  rememberOfficeState,
  restorePayload,
  sessionOnStrip,
  solidPayload,
  tagPayload,
  unfreezePayload,
} from "app/utils/wled";

export { DISPLAY_MODES };
export type { DisplayMode };
export type PomoPhase = "idle" | Phase;
export type PomoConfig = SessionConfig;

const MIN = 60 * 1000;
const DEFAULT_CONFIG: PomoConfig = {
  workMs: 50 * MIN,
  breakMs: 10 * MIN,
  longBreakMs: null,
  longBreakEvery: 4,
  displayMode: "bar",
};

const POLL_RUNNING_MS = 3000;
const POLL_IDLE_MS = 10_000;
const FLASH_STEP_MS = 160;
// Browsers that don't flash wait this long into a new phase before painting
const QUIET_MS = 1000;

export function formatPomoTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function shownProgress(progress: number, mode: DisplayMode): number {
  if (progress >= 1) return 1;
  if (mode === "quarters") return Math.floor(progress * 4) / 4;
  if (mode === "solid") return 0;
  return progress;
}

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

// Rounded to whole seconds like on the strip, so our copy matches what
// other browsers read back
const asStored = (s: Session) => decodeSession(encodeSession(s)) ?? s;

const MUTE_KEY = "wled-pomo-mute";
function loadMute() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function firstSuccess<T>(tasks: Promise<T>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let left = tasks.length;
    if (left === 0) resolve(null);
    for (const task of tasks) {
      task.then(resolve, () => {
        left -= 1;
        if (left === 0) resolve(null);
      });
    }
  });
}

// mDNS (".local") is flaky on some machines, so the strip's IP is remembered
const HOST_KEY = "wled-pomo-host";

async function findStrip() {
  let remembered: string | null = null;
  try {
    remembered = localStorage.getItem(HOST_KEY);
  } catch {
    // Ignore
  }
  const hosts = Array.from(
    new Set([remembered, ...WLED_URLS].filter(Boolean)),
  ) as string[];
  return firstSuccess(
    hosts.map(async (host) => {
      const data = await new WledClient(host).read();
      const ipHost = data.info?.ip ? `http://${data.info.ip}` : host;
      try {
        localStorage.setItem(HOST_KEY, ipHost);
      } catch {
        // Ignore
      }
      return { host: ipHost, data };
    }),
  );
}

/**
 * One pomodoro for the whole office. The session is stored on the strip;
 * every browser reads it, paints the same frames from it, and can change it.
 */
export function useWledPomo() {
  const isMock =
    new URLSearchParams(window.location.search).get("wled") === "mock";

  const clientRef = useRef<WledClient>(
    isMock ? new MockWledClient() : new WledClient(WLED_URLS[0]),
  );
  const [isReachable, setIsReachable] = useState(isMock);
  // Tagged by an older version, or holding a session we can't read
  const [orphaned, setOrphaned] = useState(false);
  const [ledCount, setLedCount] = useState(900);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [mute, setMute] = useState(loadMute);
  const [anchor, setAnchorState] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());

  const anchorRef = useRef<Session | null>(null);
  const flashingRef = useRef(false);
  const lastWriteRef = useRef(0);
  const lastReadRef = useRef(0);
  const missedReadsRef = useRef(0);

  const setAnchor = useCallback((next: Session | null) => {
    anchorRef.current = next;
    setAnchorState(next);
    setNow(Date.now());
  }, []);

  const readStrip = useCallback(async (): Promise<WledJson | null> => {
    const client = clientRef.current;
    try {
      return await client.read();
    } catch {
      if (isMock) return null;
    }
    const found = await findStrip();
    if (found) client.host = found.host;
    return found?.data ?? null;
  }, [isMock]);

  const writeState = useCallback(async (payload: object) => {
    lastWriteRef.current = Date.now();
    await clientRef.current.state.push(payload);
    lastWriteRef.current = Date.now();
  }, []);

  const remember = useCallback(
    (data: WledJson | null) => {
      if (!isMock) rememberOfficeState(data?.state);
    },
    [isMock],
  );

  /** Stops the session for everyone and gives the lights back */
  const endSession = useCallback(async () => {
    flashingRef.current = false;
    setAnchor(null);
    setOrphaned(false);
    await clientRef.current.frames.settle();
    await writeState(restorePayload());
  }, [setAnchor, writeState]);

  const sync = useCallback(async () => {
    const askedAt = Date.now();
    const data = await readStrip();
    if (!data) {
      // One miss is often just a slow mDNS lookup
      missedReadsRef.current += 1;
      if (missedReadsRef.current >= 2 && !anchorRef.current)
        setIsReachable(false);
      return;
    }
    missedReadsRef.current = 0;
    setIsReachable(true);
    if (data.info?.leds?.count) setLedCount(data.info.leds.count);

    // Skip reads that are older than one already used, or than our own writes
    const client = clientRef.current;
    if (askedAt < lastReadRef.current) return;
    if (askedAt < lastWriteRef.current || client.state.busy) return;
    lastReadRef.current = askedAt;

    const state = data.state;
    const onStrip = sessionOnStrip(state);
    remember(data);
    setOrphaned(isPomoState(state) && !onStrip);

    if (onStrip && isExpired(onStrip, Date.now())) return endSession();

    const had = anchorRef.current;
    if (sameSession(had, onStrip)) return;
    if (!onStrip) flashingRef.current = false;
    setAnchor(onStrip);

    // Stopped elsewhere, but a frame of ours may have landed after their
    // restore and frozen the strip. Unfreezing brings the office look back.
    if (had && !onStrip) {
      await client.frames.settle();
      const after = await readStrip();
      if (isLeftoverFrame(after?.state)) await writeState(unfreezePayload);
    }
  }, [readStrip, remember, endSession, setAnchor, writeState]);

  const isRunning = anchor !== null;
  useEffect(() => {
    void sync();
    const interval = window.setInterval(
      () => void sync(),
      isRunning ? POLL_RUNNING_MS : POLL_IDLE_MS,
    );
    const onWake = () => void sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === MockWledClient.KEY) void sync();
    };
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
      window.removeEventListener("storage", onStorage);
    };
  }, [sync, isRunning]);

  useEffect(() => {
    const client = clientRef.current;
    return () => void client.frames.settle();
  }, []);

  /** Applies a change here and on the strip. Ignored during the flash. */
  const change = useCallback(
    (fn: (s: Session, now: number) => Session) => {
      const a = anchorRef.current;
      if (!a || flashingRef.current) return null;
      const t = Date.now();
      const next = asStored(fn(sessionAt(a, t).session, t));
      setAnchor(next);
      void writeState(tagPayload(encodeSession(next)));
      return next;
    },
    [setAnchor, writeState],
  );

  const startSession = useCallback(
    async (overrides?: Partial<PomoConfig>) => {
      const cfg = { ...config, ...overrides };
      setConfig(cfg);
      if (
        !mute &&
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        void Notification.requestPermission().catch(() => {});
      }

      // Read first, for the office look and in case someone just started one
      const askedAt = Date.now();
      const data = await readStrip();
      const existing = sessionOnStrip(data?.state);
      if (existing && !isExpired(existing, Date.now())) {
        if (askedAt >= lastWriteRef.current) setAnchor(existing);
        return;
      }
      remember(data);
      const count = data?.info?.leds?.count ?? ledCount;
      setLedCount(count);

      const next = asStored(startAt(cfg, Date.now()));
      await writeState(claimPayload(data?.state, count, encodeSession(next)));
      setAnchor(next);
      setOrphaned(false);
      if (!mute) playCue("start");
    },
    [config, ledCount, mute, readStrip, remember, setAnchor, writeState],
  );

  const { session, rolled } = anchor
    ? sessionAt(anchor, now)
    : { session: null, rolled: false };
  const paused = session?.endsAt === null;
  const durationMs = session ? durationOf(session.config, session.phase) : 0;
  const remainingMs = session ? remainingOf(session, now) : config.workMs;
  const phaseStartedAt =
    session?.endsAt != null ? session.endsAt - durationMs : null;
  const phaseKey = session
    ? `${session.cycle}:${session.phase}:${phaseStartedAt ?? "paused"}`
    : null;
  const quiet =
    rolled && phaseStartedAt !== null && now - phaseStartedAt < QUIET_MS;

  // Tick when the shown second changes
  useEffect(() => {
    if (!isRunning || paused) return;
    const t = window.setTimeout(
      () => setNow(Date.now()),
      remainingMs % 1000 || 1000,
    );
    return () => window.clearTimeout(t);
  }, [isRunning, paused, remainingMs]);

  const expired = session ? isExpired(session, now) : false;
  useEffect(() => {
    if (expired) void endSession();
  }, [expired, endSession]);

  const announcePhase = useCallback(
    (s: Session, finishedCycle: number) => {
      if (mute) return;
      const length = formatPomoTime(durationOf(s.config, s.phase));
      if (s.phase === "work") {
        announce(
          "work",
          "Tilbake til jobb",
          `Runde ${s.cycle}: ${length} jobb.`,
        );
      } else {
        announce(
          "break",
          s.phase === "long-break" ? "Lang pause" : "Pause",
          `Runde ${finishedCycle} ferdig. ${length} pause.`,
        );
      }
    },
    [mute],
  );

  // When a phase runs out, every open browser plays the sound and visible
  // ones flash the strip (background tabs are slowed down too much to flash)
  const lastPhaseRef = useRef<{ key: string; cycle: number } | null>(null);
  useEffect(() => {
    const last = lastPhaseRef.current;
    lastPhaseRef.current =
      session && phaseKey ? { key: phaseKey, cycle: session.cycle } : null;
    if (!session || !last || !phaseKey || last.key === phaseKey) return;
    if (!rolled || phaseStartedAt === null) return;
    if (Date.now() - phaseStartedAt > 3000) return; // joined late
    announcePhase(session, last.cycle);
    if (document.visibilityState !== "visible") return;

    const frames = clientRef.current.frames;
    const colour = session.phase === "work" ? RED : BLUE;
    flashingRef.current = true;
    void (async () => {
      for (const col of [WHITE, colour, WHITE, colour, WHITE, colour]) {
        if (!flashingRef.current) return; // stopped meanwhile
        frames.push(solidPayload(ledCount, col));
        await sleep(FLASH_STEP_MS);
      }
      flashingRef.current = false;
      setNow(Date.now());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseKey]);

  const displayMode = session?.config.displayMode ?? config.displayMode;
  const elapsed = Math.min(durationMs, Math.max(0, durationMs - remainingMs));
  const progress = session ? elapsed / durationMs : 0;
  const isWork = session?.phase === "work";
  const shown = shownProgress(progress, displayMode);
  const blueRatio = session ? (isWork ? shown : 1 - shown) : 0;
  const rawBlueRatio = session ? (isWork ? progress : 1 - progress) : 0;
  const blueLeds = Math.round(blueRatio * ledCount);
  const markerAt = paused ? Math.round(rawBlueRatio * ledCount) : null;

  useEffect(() => {
    if (!isRunning || expired || quiet || flashingRef.current) return;
    clientRef.current.frames.push(
      progressPayload(ledCount, blueLeds, markerAt),
    );
  }, [isRunning, expired, quiet, phaseKey, ledCount, blueLeds, markerAt]);

  const togglePause = useCallback(() => void change(togglePauseAt), [change]);
  const restartPhase = useCallback(() => void change(restartAt), [change]);
  const scrub = useCallback(
    (dir: 1 | -1) => void change((s, t) => scrubAt(s, t, dir)),
    [change],
  );
  const skipPhase = useCallback(() => {
    const a = anchorRef.current;
    const finishedCycle = a ? sessionAt(a, Date.now()).session.cycle : 1;
    const next = change(nextPhase);
    if (next) announcePhase(next, finishedCycle);
  }, [change, announcePhase]);

  const updateConfig = useCallback(
    (partial: Partial<PomoConfig>) => {
      setConfig((c) => ({ ...c, ...partial }));
      change((s) => ({ ...s, config: { ...s.config, ...partial } }));
    },
    [change],
  );

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => updateConfig({ displayMode: mode }),
    [updateConfig],
  );

  const activeConfig = session?.config ?? config;

  const cycleMode = useCallback(() => {
    const idx = DISPLAY_MODES.indexOf(activeConfig.displayMode);
    setDisplayMode(DISPLAY_MODES[(idx + 1) % DISPLAY_MODES.length]);
  }, [activeConfig.displayMode, setDisplayMode]);

  // Sound is per browser, not part of the shared session
  const toggleMute = useCallback(() => {
    const next = !mute;
    setMute(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      // Ignore
    }
  }, [mute]);

  return {
    status: {
      isReachable,
      isMock,
      orphaned,
      isRunning,
      isPaused: paused,
      phase: (session?.phase ?? "idle") as PomoPhase,
      cycle: session?.cycle ?? 1,
      remainingMs,
      /** null when idle or paused */
      phaseEndsAt: session?.endsAt ?? null,
      ledCount,
      blueLeds,
      blueRatio,
      rawBlueRatio,
      displayMode,
      mute,
    },
    config: activeConfig,
    updateConfig,
    startSession,
    stopSession: endSession,
    /** For a strip an older version left tagged */
    restoreLights: endSession,
    togglePause,
    restartPhase,
    skipPhase,
    scrub,
    setDisplayMode,
    cycleMode,
    toggleMute,
  };
}

export type PomoStatus = ReturnType<typeof useWledPomo>["status"];
