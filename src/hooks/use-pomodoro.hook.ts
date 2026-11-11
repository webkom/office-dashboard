import { useCallback, useEffect, useRef, useState } from "react";
import type { Strip } from "app/hooks/use-strip.hook";
import { notify } from "app/utils/pomo-notify";
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
  modeOf,
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
  clearSteadyTimeout,
  steadySleep,
  steadyTimeout,
} from "app/utils/steady-timer";
import { animate } from "app/utils/strip-animation";
import type { WledState } from "app/utils/wled-client";
import {
  encodeTag,
  isLeftoverFrame,
  isPomoState,
  noteOf,
  painterOf,
  sessionOnStrip,
} from "app/utils/wled-names";
import {
  OfficeLook,
  WHITE,
  claimPayload,
  fallbackLookPayload,
  frameFor,
  loadOfficeLookPayload,
  noEatenSeg,
  officeLookOf,
  saveOfficeLookPayload,
  shownProgress,
  solidPayload,
  tagPayload,
  phaseColours,
  themeFrameFor,
  unfreezePayload,
  withTag,
} from "app/utils/wled-payloads";
import { firstSegment } from "app/utils/wled-client";

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
  workMode: "bar",
  breakMode: "bar",
};

const POLL_IDLE_MS = 10_000;
const POLL_RUNNING_MS = 2000;
const POLL_PAINTER_MS = 1000;
const LEASE_MS = 12_000;
const RENEW_MS = 6_000;
const FLASH_STEP_MS = 160;
// How late after a phase change we still flash and play the sound
const FLASH_WINDOW_MS = 1500;
const ANNOUNCE_WINDOW_MS = 5000;

export function formatPomoTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Rounded like on the strip, so it compares equal to what others read back
const asStored = (s: Session) => decodeSession(encodeSession(s)) ?? s;

const isVisible = () => document.visibilityState === "visible";

/** One pomodoro for the whole office, kept on the strip. Anyone can change it;
 * only the painter draws it, so browsers never paint over each other. */
export function usePomodoro(strip: Strip) {
  const { frames, lastWriteRef, read, readPresets, write, setPollDelay } =
    strip;
  const subscribe = strip.onRead;
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  // Tagged by an older version, or holding a session we can't read
  const [orphaned, setOrphaned] = useState(false);
  const [anchor, setAnchorState] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());

  const anchorRef = useRef<Session | null>(null);
  const flashingRef = useRef(false);
  const meRef = useRef(Math.random().toString(36).slice(2, 6));
  const paintingRef = useRef(false);
  const ledCountRef = useRef(strip.ledCount);
  ledCountRef.current = strip.ledCount;

  // The look saved when the session started, for phases shown in it
  const officeLookRef = useRef<OfficeLook | null>(null);
  const lookPendingRef = useRef(false);

  const setAnchor = useCallback((next: Session | null) => {
    if (!next) officeLookRef.current = null;
    anchorRef.current = next;
    setAnchorState(next);
    setNow(Date.now());
  }, []);

  const newTurn = () => ({ id: meRef.current, until: Date.now() + LEASE_MS });

  // The tag last written or read on the strip. Frames carry it, since WLED
  // drops segment 0's name when a frame moves its start (as "glitre" does).
  const tagRef = useRef<string | null>(null);
  /** A frame, keeping the session on the strip */
  const tagged = useCallback(
    <P extends { seg: readonly { id: number }[] }>(payload: P) =>
      tagRef.current ? withTag(payload, tagRef.current) : payload,
    [],
  );

  /** Makes this browser the painter, writing `s` with its name on it */
  const writeTag = useCallback(
    (s: Session) => {
      paintingRef.current = true;
      const tag = encodeTag(s, newTurn());
      tagRef.current = tag;
      return write(tagPayload(tag));
    },
    [write],
  );

  const paint = useCallback(() => {
    const a = anchorRef.current;
    if (!a || !paintingRef.current || flashingRef.current) return;
    const t = Date.now();
    if (isExpired(a, t)) return;
    const { session } = sessionAt(a, t);
    if (modeOf(session.config, session.phase) !== "theme") {
      frames.push(tagged(frameFor(a, t, ledCountRef.current)));
      return;
    }
    if (officeLookRef.current) {
      frames.push(
        tagged(themeFrameFor(a, t, ledCountRef.current, officeLookRef.current)),
      );
      return;
    }
    // Read once; the next paint, within a second, shows it
    if (lookPendingRef.current) return;
    lookPendingRef.current = true;
    void readPresets().then((presets) => {
      lookPendingRef.current = false;
      if (presets && anchorRef.current)
        officeLookRef.current = officeLookOf(presets);
    });
  }, [frames, readPresets, tagged]);

  const endSession = useCallback(async () => {
    flashingRef.current = false;
    paintingRef.current = false;
    tagRef.current = null;
    setAnchor(null);
    setOrphaned(false);
    await frames.settle();
    const before = await read();
    // The tag is kept, as moving segment 0 back would drop it, so it still
    // tells whether the preset loaded
    await write({
      ...loadOfficeLookPayload,
      seg: [
        {
          id: 0,
          start: 0,
          stop: ledCountRef.current,
          frz: false,
          rev: false,
          n: firstSegment(before?.state)?.n ?? "",
        },
        noEatenSeg,
      ],
    });
    // WLED applies a preset a moment later. Without one saved, bright white.
    await steadySleep(400);
    const after = await read();
    if (after && isPomoState(after.state)) {
      await write(fallbackLookPayload);
    } else {
      await write({
        seg: [
          {
            id: 0,
            start: 0,
            stop: ledCountRef.current,
            frz: false,
            rev: false,
          },
          noEatenSeg,
        ],
      });
    }
    // The office look turns the strip on; switched off, it stays off
    if (before?.state?.on === false) await write({ on: false });
  }, [frames, read, setAnchor, write]);

  const onRead = useCallback(
    async (state: WledState | undefined) => {
      const onStrip = sessionOnStrip(state);
      setOrphaned(isPomoState(state) && !onStrip);
      if (onStrip && isExpired(onStrip, Date.now())) return endSession();

      // A free turn goes to a visible browser first; background tabs wait
      const painter = painterOf(state);
      const t = Date.now();
      const mine = painter?.id === meRef.current && painter.until > t;
      const free =
        !painter || painter.until <= t - (isVisible() ? 0 : LEASE_MS);
      paintingRef.current = Boolean(onStrip) && mine;
      tagRef.current = onStrip ? (firstSegment(state)?.n ?? null) : null;
      if (onStrip && (free || (mine && painter!.until - t < RENEW_MS)))
        await writeTag(onStrip);

      const had = anchorRef.current;
      if (!sameSession(had, onStrip)) {
        if (!onStrip) flashingRef.current = false;
        setAnchor(onStrip);
      }
      paint();

      // Stopped elsewhere: a frame of ours may have landed after their restore
      if (had && !onStrip) {
        await frames.settle();
        const after = await read();
        if (isLeftoverFrame(after?.state)) await write(unfreezePayload);
      }
    },
    [endSession, frames, paint, read, setAnchor, write, writeTag],
  );
  useEffect(() => subscribe(onRead), [subscribe, onRead]);

  useEffect(() => {
    setPollDelay(() =>
      !anchorRef.current
        ? POLL_IDLE_MS
        : paintingRef.current
          ? POLL_PAINTER_MS
          : POLL_RUNNING_MS,
    );
  }, [setPollDelay]);

  // Built on the strip's current session, so it never undoes someone else's
  // change, and queued so quick presses all count
  const changesRef = useRef<Promise<void>>(Promise.resolve());
  const change = useCallback(
    (fn: (s: Session, now: number) => Session) => {
      if (!anchorRef.current || flashingRef.current) return;
      changesRef.current = changesRef.current.then(async () => {
        const data = await read();
        if (data && !sessionOnStrip(data.state)) return; // stopped meanwhile
        const base = sessionOnStrip(data?.state) ?? anchorRef.current;
        if (!base) return;
        const t = Date.now();
        const next = asStored(fn(sessionAt(base, t).session, t));
        setAnchor(next);
        await writeTag(next);
        paint();
      });
    },
    [paint, read, setAnchor, writeTag],
  );

  const startSession = useCallback(
    async (overrides?: Partial<PomoConfig>) => {
      const cfg = { ...config, ...overrides };
      setConfig(cfg);
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      ) {
        void Notification.requestPermission().catch(() => {});
      }

      // Read first, for the office look and in case someone just started one
      const askedAt = Date.now();
      const data = await read();
      const existing = sessionOnStrip(data?.state);
      if (existing && !isExpired(existing, Date.now())) {
        if (askedAt >= lastWriteRef.current) setAnchor(existing);
        return;
      }
      const count = data?.info?.leds?.count ?? strip.ledCount;

      // An event's look is not the office look
      const next = asStored(startAt(cfg, Date.now()));
      if (!isPomoState(data?.state) && !noteOf(data?.state).playing)
        await write(saveOfficeLookPayload);
      paintingRef.current = true;
      const tag = encodeTag(next, newTurn());
      tagRef.current = tag;
      await write(claimPayload(data?.state, count, tag));
      setAnchor(next);
      setOrphaned(false);
      paint();
    },
    [config, lastWriteRef, paint, read, setAnchor, strip.ledCount, write],
  );

  const session = anchor ? sessionAt(anchor, now).session : null;
  const isRunning = anchor !== null;
  const paused = session?.endsAt === null;
  const durationMs = session ? durationOf(session.config, session.phase) : 0;
  const remainingMs = session ? remainingOf(session, now) : config.workMs;
  const phaseStartedAt =
    session?.endsAt != null ? session.endsAt - durationMs : null;
  const phaseId = session ? `${session.cycle}:${session.phase}` : null;

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

  const announcePhase = useCallback((s: Session, finishedCycle: number) => {
    const length = formatPomoTime(durationOf(s.config, s.phase));
    if (s.phase === "work") {
      notify("Tilbake til jobb", `Runde ${s.cycle}: ${length} jobb.`);
    } else {
      notify(
        s.phase === "long-break" ? "Lang pause" : "Pause",
        `Runde ${finishedCycle} ferdig. ${length} pause.`,
      );
    }
  }, []);

  // On a phase change every browser notifies; the painter flashes
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

    // The colour the new phase starts in, before green eats it
    const colour = phaseColours(session.phase)[1];
    const colours = [WHITE, colour, WHITE, colour, WHITE, colour];
    flashingRef.current = true;
    void (async () => {
      const done = await animate(
        frames,
        colours.length,
        colours.length * FLASH_STEP_MS,
        (_, k) => tagged(solidPayload(ledCountRef.current, colours[k])),
        () => !flashingRef.current,
      );
      flashingRef.current = false;
      if (done) paint();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  const displayMode = session
    ? modeOf(session.config, session.phase)
    : config.workMode;
  const elapsed = Math.min(durationMs, Math.max(0, durationMs - remainingMs));
  const progress = session ? elapsed / durationMs : 0;
  const fillRatio = session ? shownProgress(progress, displayMode) : 0;
  const upcoming = session ? nextPhase(session, 0) : null;

  const togglePause = useCallback(() => change(togglePauseAt), [change]);
  const restartPhase = useCallback(() => change(restartAt), [change]);
  const scrub = useCallback(
    (dir: 1 | -1) => change((s, t) => scrubAt(s, t, dir)),
    [change],
  );
  const skipPhase = useCallback(() => change(nextPhase), [change]);

  const updateConfig = useCallback(
    (partial: Partial<PomoConfig>) => {
      setConfig((c) => ({ ...c, ...partial }));
      change((s) => ({ ...s, config: { ...s.config, ...partial } }));
    },
    [change],
  );

  const setDisplayMode = useCallback(
    (part: "work" | "break", mode: DisplayMode) =>
      updateConfig(part === "work" ? { workMode: mode } : { breakMode: mode }),
    [updateConfig],
  );

  const activeConfig = session?.config ?? config;

  // The mode of the phase that is running
  const cycleMode = useCallback(() => {
    const part = !session || session.phase === "work" ? "work" : "break";
    const idx = DISPLAY_MODES.indexOf(displayMode);
    setDisplayMode(part, DISPLAY_MODES[(idx + 1) % DISPLAY_MODES.length]);
  }, [displayMode, session, setDisplayMode]);

  const isRunningNow = useCallback(() => anchorRef.current !== null, []);

  return {
    status: {
      isReachable: strip.isReachable,
      isMock: strip.isMock,
      orphaned,
      isRunning,
      isPaused: paused,
      phase: (session?.phase ?? "idle") as PomoPhase,
      cycle: session?.cycle ?? 1,
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
      ledCount: strip.ledCount,
      filledLeds: Math.round(fillRatio * strip.ledCount),
      /** How far the phase's colour has filled the strip, as shown */
      fillRatio,
      /** The same, without the display mode's steps */
      rawFillRatio: progress,
      displayMode,
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
    isRunningNow,
  };
}

export type Pomodoro = ReturnType<typeof usePomodoro>;
export type PomoStatus = Pomodoro["status"];
