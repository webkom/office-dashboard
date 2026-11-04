import { useCallback, useEffect, useRef, useState } from "react";
import { WLED_URLS } from "app/config";
import { useBirthdayArrivals } from "app/hooks/use-birthday-arrivals.hook";
import { useEvening } from "app/hooks/use-evening.hook";
import { useMergedPrs } from "app/hooks/use-merged-prs.hook";
import { usePresenceLights } from "app/hooks/use-presence-lights.hook";
import {
  LightPreset,
  presetOf,
  presetOfId,
  presetPayload,
} from "app/utils/light-presets";
import { announce, playCue } from "app/utils/pomo-sounds";
import {
  clearSteadyTimeout,
  steadySleep,
  steadyTimeout,
} from "app/utils/steady-timer";
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
  LightSettings,
  Note,
  Rgb,
  WledJson,
  WledState,
  bandPayload,
  claimPayload,
  encodeNote,
  encodeTag,
  fallbackLookPayload,
  fireworksPayload,
  growPayload,
  isLeftoverFrame,
  isPomoState,
  loadOfficeLookPayload,
  lookOf,
  noteOf,
  painterOf,
  progressPayload,
  restoreFrom,
  saveOfficeLookPayload,
  sessionOnStrip,
  solidPayload,
  tagPayload,
  unfreezePayload,
} from "app/utils/wled";

export { DISPLAY_MODES };
export type { DisplayMode };
export type PomoPhase = "idle" | Phase;
export type PomoConfig = SessionConfig;

export const PHASE_NAME: Record<Phase, string> = {
  work: "jobb",
  break: "pause",
  "long-break": "lang pause",
};

const MIN = 60 * 1000;
const DEFAULT_CONFIG: PomoConfig = {
  workMs: 50 * MIN,
  breakMs: 10 * MIN,
  longBreakMs: null,
  longBreakEvery: 4,
  displayMode: "bar",
};

const POLL_RUNNING_MS = 2000;
const POLL_IDLE_MS = 10_000;
// The painter reads the strip before each frame, once a second
const POLL_PAINTER_MS = 1000;
// How long the painter's turn lasts, and when it renews it
const LEASE_MS = 12_000;
const RENEW_MS = 6_000;
const FLASH_STEP_MS = 160;
const CELEBRATION_MS = 3000;
const GROW_MS = 700;
const GROW_STEPS = 14;
const WARM: Rgb = [255, 170, 90];
const SWEEP_MS = 1400;
const SWEEP_STEPS = 24;
const GREEN: Rgb = [30, 230, 90];
// One-minute fades for the evening and the morning
const DAY_FADE = 600;
const DAY_LOOK_KEY = "wled-pomo-day-look";
// How soon after a phase starts the painter still flashes / others still play
// the sound
const FLASH_WINDOW_MS = 1500;
const ANNOUNCE_WINDOW_MS = 5000;

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

/** The strip's picture of a session at `now` */
function frameFor(stored: Session, now: number, ledCount: number) {
  const { session } = sessionAt(stored, now);
  const duration = durationOf(session.config, session.phase);
  const left = remainingOf(session, now);
  const progress = Math.min(1, Math.max(0, (duration - left) / duration));
  const isWork = session.phase === "work";
  const shown = shownProgress(progress, session.config.displayMode);
  const blue = Math.round((isWork ? shown : 1 - shown) * ledCount);
  const raw = Math.round((isWork ? progress : 1 - progress) * ledCount);
  return progressPayload(ledCount, blue, session.endsAt === null ? raw : null);
}

const sleep = steadySleep;

const isVisible = () => document.visibilityState === "visible";

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
 * One pomodoro for the whole office. The strip is the only source of truth:
 * it holds the session, which browser paints it, and the office look to put
 * back. Every browser reads it and can change the session; only the painter
 * draws frames, from a fresh read, so browsers never paint over each other.
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
  const [isOn, setIsOn] = useState(true);
  const [bri, setBri] = useState(128);
  const [look, setLook] = useState<ReturnType<typeof lookOf>>(null);
  const [note, setNote] = useState<Note>(() => noteOf(null));
  const lightColor = (presetOf(look)?.shown ??
    look?.col?.slice(0, 3) ??
    WARM) as Rgb;
  // Read by the turn-on animation, which outlives a render
  const isOnRef = useRef(isOn);
  isOnRef.current = isOn;
  const lightColorRef = useRef(lightColor);
  lightColorRef.current = lightColor;
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [mute, setMute] = useState(loadMute);
  const [anchor, setAnchorState] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());

  const anchorRef = useRef<Session | null>(null);
  const flashingRef = useRef(false);
  const meRef = useRef(Math.random().toString(36).slice(2, 6));
  const paintingRef = useRef(false);
  const ledCountRef = useRef(ledCount);
  ledCountRef.current = ledCount;
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

  /** Makes this browser the painter, writing `s` with its name on it */
  const writeTag = useCallback(
    (s: Session) => {
      paintingRef.current = true;
      const painter = { id: meRef.current, until: Date.now() + LEASE_MS };
      return writeState(tagPayload(encodeTag(s, painter)));
    },
    [writeState],
  );

  /** Draws the current session, if this browser is the painter */
  const paint = useCallback(() => {
    const a = anchorRef.current;
    if (!a || !paintingRef.current || flashingRef.current) return;
    if (isExpired(a, Date.now())) return;
    clientRef.current.frames.push(frameFor(a, Date.now(), ledCountRef.current));
  }, []);

  /** Stops the session for everyone and gives the lights back */
  const endSession = useCallback(async () => {
    flashingRef.current = false;
    paintingRef.current = false;
    setAnchor(null);
    setOrphaned(false);
    await clientRef.current.frames.settle();
    await writeState(loadOfficeLookPayload);
    // WLED applies a preset a moment later. Without one saved, warm white.
    await sleep(400);
    const after = await readStrip();
    if (after && isPomoState(after.state))
      await writeState(fallbackLookPayload);
  }, [readStrip, setAnchor, writeState]);

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
    setIsOn(state?.on !== false);
    if (typeof state?.bri === "number") setBri(state.bri);
    setLook(lookOf(state));
    const onStrip = sessionOnStrip(state);
    if (!onStrip) setNote(noteOf(state));
    setOrphaned(isPomoState(state) && !onStrip);

    if (onStrip && isExpired(onStrip, Date.now())) return endSession();

    // Whose turn it is to paint. The painter renews its turn while it is
    // open; a free turn goes to a visible browser at once, and to a background
    // tab only when nobody else has taken it for a while.
    const painter = painterOf(state);
    const t = Date.now();
    const mine = painter?.id === meRef.current && painter.until > t;
    const free = !painter || painter.until <= t - (isVisible() ? 0 : LEASE_MS);
    paintingRef.current = Boolean(onStrip) && mine;
    if (onStrip && (free || (mine && painter!.until - t < RENEW_MS)))
      await writeTag(onStrip);

    const had = anchorRef.current;
    if (!sameSession(had, onStrip)) {
      if (!onStrip) flashingRef.current = false;
      setAnchor(onStrip);
    }
    paint();
    if (sameSession(had, onStrip)) return;

    // Stopped elsewhere, but a frame of ours may have landed after their
    // restore and frozen the strip. Unfreezing brings the office look back.
    if (had && !onStrip) {
      await client.frames.settle();
      const after = await readStrip();
      if (isLeftoverFrame(after?.state)) await writeState(unfreezePayload);
    }
  }, [readStrip, endSession, setAnchor, writeState, writeTag, paint]);

  const isRunning = anchor !== null;
  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const loop = async () => {
      await sync();
      if (stopped) return;
      const delay = !anchorRef.current
        ? POLL_IDLE_MS
        : paintingRef.current
          ? POLL_PAINTER_MS
          : POLL_RUNNING_MS;
      timer = steadyTimeout(() => void loop(), delay);
    };
    void loop();
    const onWake = () => void sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === MockWledClient.KEY) void sync();
    };
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    window.addEventListener("storage", onStorage);
    return () => {
      stopped = true;
      clearSteadyTimeout(timer);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
      window.removeEventListener("storage", onStorage);
    };
  }, [sync]);

  useEffect(() => {
    const client = clientRef.current;
    return () => void client.frames.settle();
  }, []);

  /**
   * Applies a change for everyone. It is built on the session as the strip
   * has it right now, so it never undoes someone else's change from a moment
   * ago, and changes from this browser are applied one after another.
   * Ignored during the flash.
   */
  const changesRef = useRef<Promise<void>>(Promise.resolve());
  const change = useCallback(
    (fn: (s: Session, now: number) => Session) => {
      if (!anchorRef.current || flashingRef.current) return;
      changesRef.current = changesRef.current.then(async () => {
        const data = await readStrip();
        if (data && !sessionOnStrip(data.state)) return; // stopped meanwhile
        const base = sessionOnStrip(data?.state) ?? anchorRef.current;
        if (!base) return;
        const t = Date.now();
        const next = asStored(fn(sessionAt(base, t).session, t));
        setAnchor(next);
        // Whoever changes it paints it, so the strip follows at once
        await writeTag(next);
        paint();
      });
    },
    [readStrip, setAnchor, writeTag, paint],
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
      const count = data?.info?.leds?.count ?? ledCount;
      setLedCount(count);

      const next = asStored(startAt(cfg, Date.now()));
      if (!isPomoState(data?.state)) await writeState(saveOfficeLookPayload);
      paintingRef.current = true;
      const painter = { id: meRef.current, until: Date.now() + LEASE_MS };
      await writeState(
        claimPayload(data?.state, count, encodeTag(next, painter)),
      );
      setAnchor(next);
      setOrphaned(false);
      paint();
      if (!mute) playCue("start");
    },
    [config, ledCount, mute, readStrip, setAnchor, writeState, paint],
  );

  const session = anchor ? sessionAt(anchor, now).session : null;
  const paused = session?.endsAt === null;
  const durationMs = session ? durationOf(session.config, session.phase) : 0;
  const remainingMs = session ? remainingOf(session, now) : config.workMs;
  const phaseStartedAt =
    session?.endsAt != null ? session.endsAt - durationMs : null;
  const phaseId = session ? `${session.cycle}:${session.phase}` : null;

  // Tick when the shown second changes
  useEffect(() => {
    if (!isRunning || paused) return;
    const t = steadyTimeout(
      () => setNow(Date.now()),
      remainingMs % 1000 || 1000,
    );
    return () => clearSteadyTimeout(t);
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

  // When the phase changes, by running out or by a skip, every open browser
  // plays the sound and the painter flashes the strip
  const lastPhaseRef = useRef<{ id: string; cycle: number } | null>(null);
  useEffect(() => {
    const last = lastPhaseRef.current;
    lastPhaseRef.current =
      session && phaseId ? { id: phaseId, cycle: session.cycle } : null;
    if (!session || !last || !phaseId || last.id === phaseId) return;
    if (phaseStartedAt === null) return;
    const age = Date.now() - phaseStartedAt;
    if (age > ANNOUNCE_WINDOW_MS) return; // joined late
    announcePhase(session, last.cycle);
    if (age > FLASH_WINDOW_MS || !paintingRef.current) return;

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
      paint();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  const displayMode = session?.config.displayMode ?? config.displayMode;
  const elapsed = Math.min(durationMs, Math.max(0, durationMs - remainingMs));
  const progress = session ? elapsed / durationMs : 0;
  const isWork = session?.phase === "work";
  const shown = shownProgress(progress, displayMode);
  const blueRatio = session ? (isWork ? shown : 1 - shown) : 0;
  const rawBlueRatio = session ? (isWork ? progress : 1 - progress) : 0;
  const blueLeds = Math.round(blueRatio * ledCount);
  const upcoming = session ? nextPhase(session, 0) : null;

  const togglePause = useCallback(() => void change(togglePauseAt), [change]);
  const restartPhase = useCallback(() => void change(restartAt), [change]);
  const scrub = useCallback(
    (dir: 1 | -1) => void change((s, t) => scrubAt(s, t, dir)),
    [change],
  );
  const skipPhase = useCallback(() => void change(nextPhase), [change]);

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

  // When the office empties the strip turns off, and on again when someone
  // arrives. A session nobody is there for ends first, or its frames would
  // turn the strip back on.
  const growRef = useRef(0);
  const setLights = useCallback(
    async (on: boolean) => {
      setIsOn(on);
      if (on) return writeState({ on });
      // Stop a turn-on animation, so none of its frames turns the strip back on
      growRef.current += 1;
      await clientRef.current.frames.settle();
      await writeState({ on: false, seg: [{ id: 0, frz: false }] });
    },
    [writeState],
  );
  const switchOff = useCallback(async () => {
    if (anchorRef.current) await endSession();
    await setLights(false);
  }, [endSession, setLights]);
  /** From off, the strip lights up from its centre outwards before showing
   * its usual look */
  const turnOn = useCallback(async () => {
    const wasOn = isOnRef.current;
    setIsOn(true);
    if (wasOn || anchorRef.current) return writeState({ on: true });
    const frames = clientRef.current.frames;
    const id = ++growRef.current;
    const stopped = () => growRef.current !== id || anchorRef.current !== null;
    for (let k = 1; k <= GROW_STEPS; k++) {
      if (stopped()) return;
      lastWriteRef.current = Date.now();
      const eased = 1 - (1 - k / GROW_STEPS) ** 3;
      const lit = Math.round(eased * ledCount);
      frames.push(growPayload(ledCount, lit, lightColorRef.current));
      await sleep(GROW_MS / GROW_STEPS);
    }
    await frames.idle();
    if (!stopped()) await writeState(unfreezePayload);
  }, [ledCount, writeState]);
  // Every browser notices an arrival; the first one turns the lights on
  const switchOn = useCallback(async () => {
    const data = await readStrip();
    if (data?.state?.on !== false) return setIsOn(true);
    isOnRef.current = false;
    await turnOn();
  }, [readStrip, turnOn]);
  const present = usePresenceLights(switchOff, switchOn);

  // By hand, for anyone the office tracking doesn't see. Since only changes
  // in who is there switch the strip, it stays the way it is set here.
  const toggleLights = useCallback(
    () => void (isOn ? setLights(false) : turnOn()),
    [isOn, setLights, turnOn],
  );

  // Dragging sends a lot of values; only the newest one waiting is sent
  const setBrightness = useCallback((value: number) => {
    setBri(value);
    setIsOn(true);
    lastWriteRef.current = Date.now();
    clientRef.current.frames.push({ on: true, bri: value, transition: 0 });
  }, []);

  const applyPreset = useCallback(
    (p: LightPreset) => {
      setIsOn(true);
      setBri(p.bri);
      setLook({ fx: p.fx, col: p.col });
      void writeState(presetPayload(p));
    },
    [writeState],
  );

  /**
   * Shows a one-off event, such as a birthday, once however many browsers
   * notice it: the note on the strip says it has been shown. Never during a
   * pomodoro, and not if the office has turned that kind of event off.
   */
  const playEvent = useCallback(
    async (
      event: string,
      setting: keyof LightSettings,
      show: () => Promise<void>,
      finish: (note: string, before: WledState | undefined) => object,
      intoDark = false,
    ) => {
      if (anchorRef.current) return;
      const data = await readStrip();
      if (!data || sessionOnStrip(data.state)) return;
      const current = noteOf(data.state);
      if (!current.settings[setting] || current.event === event) return;
      if (!intoDark && data.state?.on === false) return;
      await writeState(
        tagPayload(encodeNote({ ...current, event, playing: true })),
      );
      await show();
      await clientRef.current.frames.idle();
      // Left alone if someone has started a pomodoro meanwhile
      const after = noteOf((await readStrip())?.state);
      if (after.playing && after.event === event)
        await writeState(
          finish(encodeNote({ ...current, event, playing: false }), data.state),
        );
    },
    [readStrip, writeState],
  );

  // A member with a birthday arrives: a few seconds of fireworks
  useBirthdayArrivals(
    (key) =>
      void playEvent(
        `b:${key}`,
        "birthday",
        async () => {
          await writeState(fireworksPayload);
          await sleep(CELEBRATION_MS);
        },
        (note, before) => restoreFrom(before, note),
        true,
      ),
  );

  // A pull request is merged: a green wave runs once along the strip
  const sweep = useCallback(async () => {
    const frames = clientRef.current.frames;
    const width = Math.round(ledCount * 0.12);
    for (let k = 0; k <= SWEEP_STEPS; k++) {
      lastWriteRef.current = Date.now();
      const eased = (1 - Math.cos((Math.PI * k) / SWEEP_STEPS)) / 2;
      const at = -width / 2 + (ledCount + width) * eased;
      frames.push(
        bandPayload(ledCount, lightColorRef.current, GREEN, at, width),
      );
      await sleep(SWEEP_MS / SWEEP_STEPS);
    }
  }, [ledCount]);
  useMergedPrs(
    isReachable && note.settings.merges,
    (key) =>
      void playEvent(`p:${key}`, "merges", sweep, (n) => ({
        seg: [{ id: 0, frz: false, n }],
      })),
  );

  // Kveld at 20:00 and the day look back at 06:00, as one-minute fades. An
  // office with its lights off only gets the look, for when they come on.
  useEvening(async (part) => {
    if (anchorRef.current) return false;
    const data = await readStrip();
    if (!data || sessionOnStrip(data.state)) return false;
    if (!noteOf(data.state).settings.evening) return true;
    const kveld = presetOfId("evening");
    const seg = data.state?.seg?.find((x) => x.id === 0);
    const isKveld = seg?.fx === kveld.fx;
    const keepOff = (payload: { on?: boolean; bri?: number }) =>
      data.state?.on === false
        ? { ...payload, on: undefined, bri: undefined } // bri would turn it on
        : payload;

    if (part === "evening") {
      if (isKveld) return true;
      try {
        localStorage.setItem(
          DAY_LOOK_KEY,
          JSON.stringify({
            bri: data.state?.bri,
            seg: {
              fx: seg?.fx,
              col: seg?.col,
              pal: seg?.pal,
              sx: seg?.sx,
              ix: seg?.ix,
            },
          }),
        );
      } catch {
        // The morning falls back to Varm
      }
      await writeState(keepOff(presetPayload(kveld, DAY_FADE)));
      return true;
    }

    if (!isKveld) return true; // someone has picked another look
    let day: { on?: boolean; bri?: number } = presetPayload(
      presetOfId("warm"),
      DAY_FADE,
    );
    try {
      const saved = JSON.parse(
        localStorage.getItem(DAY_LOOK_KEY) ?? "null",
      ) as { bri?: number; seg: object } | null;
      if (saved)
        day = {
          on: true,
          bri: saved.bri,
          transition: DAY_FADE,
          seg: [{ id: 0, frz: false, ...saved.seg }],
        } as typeof day;
    } catch {
      // Varm it is
    }
    await writeState(keepOff(day));
    return true;
  });

  /** Turns an effect on or off for the whole office */
  const setEffect = useCallback(
    (key: keyof LightSettings, on: boolean) => {
      const next = {
        ...note,
        settings: { ...note.settings, [key]: on },
        playing: false,
      };
      setNote(next);
      void writeState(tagPayload(encodeNote(next)));
    },
    [note, writeState],
  );

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
      /** Work phases finished this session */
      roundsDone: session
        ? session.cycle - (session.phase === "work" ? 1 : 0)
        : 0,
      next: upcoming
        ? {
            phase: upcoming.phase,
            ms: durationOf(upcoming.config, upcoming.phase),
          }
        : null,
      remainingMs,
      /** null when idle or paused */
      phaseEndsAt: session?.endsAt ?? null,
      ledCount,
      blueLeds,
      blueRatio,
      rawBlueRatio,
      displayMode,
      mute,
      isOn,
      bri,
      preset: presetOf(look),
      /** Roughly what the room looks like, for the brightness bar */
      lightColor,
      effects: note.settings,
      /** Nobody is checked in at the office */
      officeEmpty: present === false,
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
    toggleLights,
    setBrightness,
    applyPreset,
    setEffect,
  };
}

export type PomoStatus = ReturnType<typeof useWledPomo>["status"];
