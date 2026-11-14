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
  THEME_SEGMENTS,
  ThemeSnapshot,
  WHITE,
  claimPayload,
  extraSegsOff,
  fallbackLookFor,
  frameFor,
  loadOfficeLookPayload,
  officeLookOf,
  saveOfficeLookPayload,
  shownProgress,
  solidPayload,
  tagPayload,
  phaseColours,
  themeFrameFor,
  themePatchFor,
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
const POLL_PAINTER_MS = 3000;
const LEASE_MS = 12_000;
const RENEW_MS = 6_000;
const CLAIM_MS = 250;
const SAVE_PRESET_WAIT_MS = 250;
const END_WAIT_MS = 1000;
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
  const {
    frames,
    lastWriteRef,
    markWrite,
    pokePoll,
    read,
    readPresets,
    write,
    setPollDelay,
  } = strip;
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
  const endingRef = useRef(false);
  const claimingRef = useRef(false);
  const observedPainterRef = useRef<{
    id: string;
    until: number;
    seenAt: number;
  } | null>(null);
  const ledCountRef = useRef(strip.ledCount);
  ledCountRef.current = strip.ledCount;

  // The look saved when the session started, for phases shown in it
  const officeLookRef = useRef<OfficeLook | null>(null);
  const lookPendingRef = useRef(false);
  const lastPaintedRef = useRef<string | null>(null);
  const solidSetupKeyRef = useRef<string | null>(null);
  const setupInFlightRef = useRef(false);
  const themeSnapshotRef = useRef<ThemeSnapshot | null>(null);
  const themeWriteInFlightRef = useRef(false);

  const setAnchor = useCallback((next: Session | null) => {
    if (!next) {
      officeLookRef.current = null;
      themeSnapshotRef.current = null;
      solidSetupKeyRef.current = null;
    }
    anchorRef.current = next;
    lastPaintedRef.current = null;
    setAnchorState(next);
    setNow(Date.now());
  }, []);

  const newTurn = () => ({ id: meRef.current, until: Date.now() + LEASE_MS });

  // The tag last written or read on the strip. Frames that change segment 0's
  // bounds carry it along, since WLED drops segment 0's name when bounds move.
  const tagRef = useRef<string | null>(null);
  /** A frame, keeping the session on the strip */
  const tagged = useCallback(
    <P extends { seg: { id: number }[] }>(payload: P) =>
      tagRef.current ? withTag(payload, tagRef.current) : payload,
    [],
  );

  /** Makes this browser the painter, writing `s` with its name on it */
  const writeTag = useCallback(
    async (s: Session): Promise<boolean> => {
      const tag = encodeTag(s, newTurn());
      const ok = await write(tagPayload(tag));
      if (ok) {
        paintingRef.current = true;
        tagRef.current = tag;
      }
      return ok;
    },
    [write],
  );

  const paint = useCallback(() => {
    const a = anchorRef.current;
    if (!a || !paintingRef.current || flashingRef.current) return;
    const t = Date.now();
    if (isExpired(a, t)) return;
    const { session } = sessionAt(a, t);
    const mode = modeOf(session.config, session.phase);
    const count = ledCountRef.current;

    if (mode !== "theme") {
      themeSnapshotRef.current = null;
      const setupKey = `${count}:${session.cycle}:${session.phase}:${mode}`;
      if (solidSetupKeyRef.current !== setupKey) {
        if (setupInFlightRef.current) return;
        setupInFlightRef.current = true;
        const fullFrame = frameFor(a, t, count, true);
        const diffKey = JSON.stringify(frameFor(a, t, count, false));
        void write(tagged(fullFrame)).then((ok) => {
          setupInFlightRef.current = false;
          if (ok && anchorRef.current && paintingRef.current) {
            solidSetupKeyRef.current = setupKey;
            lastPaintedRef.current = diffKey;
          }
        });
        return;
      }
      const frame = frameFor(a, t, count, false);
      const key = JSON.stringify(frame);
      if (key !== lastPaintedRef.current) {
        lastPaintedRef.current = key;
        frames.push(frame);
      }
      return;
    }

    solidSetupKeyRef.current = null;
    lastPaintedRef.current = null;
    if (officeLookRef.current) {
      const frame = themeFrameFor(a, t, count, officeLookRef.current);
      const patch = themePatchFor(themeSnapshotRef.current, count, frame);
      if (!patch.payload || themeWriteInFlightRef.current) return;
      themeWriteInFlightRef.current = true;
      const payload = patch.needsTag ? tagged(patch.payload) : patch.payload;
      void write(payload).then((ok) => {
        themeWriteInFlightRef.current = false;
        if (ok && anchorRef.current && paintingRef.current) {
          themeSnapshotRef.current = patch.snapshot;
        }
      });
      return;
    }
    // Read once; fall back to default look even if /presets.json fails
    if (lookPendingRef.current) return;
    lookPendingRef.current = true;
    void readPresets().then((presets) => {
      lookPendingRef.current = false;
      if (anchorRef.current) {
        officeLookRef.current = officeLookOf(presets);
        paint();
      }
    });
  }, [frames, readPresets, tagged, write]);

  const endSession = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    try {
      flashingRef.current = false;
      paintingRef.current = false;
      tagRef.current = null;
      lastPaintedRef.current = null;
      solidSetupKeyRef.current = null;
      themeSnapshotRef.current = null;
      observedPainterRef.current = null;
      setAnchor(null);
      setOrphaned(false);
      markWrite();
      await frames.settle();
      const before = await read();
      // Apply preset 250 without writing the Pomodoro tag back onto segment 0
      await write(loadOfficeLookPayload);
      // WLED applies a preset a moment later. Without one saved, bright white.
      await steadySleep(END_WAIT_MS);
      const after = await read();
      if (after && isPomoState(after.state)) {
        await write(fallbackLookFor(ledCountRef.current));
      } else {
        await write({
          transition: 0,
          seg: [
            {
              id: 0,
              start: 0,
              stop: ledCountRef.current,
              frz: false,
              rev: false,
              n: firstSegment(after?.state)?.n ?? "",
            },
            ...extraSegsOff(after?.state),
          ],
        });
      }
      // The office look turns the strip on; switched off, it stays off
      if (before?.state?.on === false)
        await write({ on: false, transition: 0 });
    } finally {
      endingRef.current = false;
    }
  }, [frames, markWrite, read, setAnchor, write]);

  const onRead = useCallback(
    async (state: WledState | undefined) => {
      if (endingRef.current) return;
      const onStrip = sessionOnStrip(state);
      setOrphaned(isPomoState(state) && !onStrip);
      if (onStrip && isExpired(onStrip, Date.now())) return endSession();

      const t = Date.now();
      const painter = painterOf(state);
      if (!onStrip || !painter || painter.id === meRef.current) {
        observedPainterRef.current = null;
      } else {
        const prev = observedPainterRef.current;
        if (!prev || prev.id !== painter.id || prev.until !== painter.until) {
          observedPainterRef.current = { ...painter, seenAt: t };
        }
      }

      // A free turn goes to a visible browser first; background tabs wait.
      // Remote leases must also stop renewing for LEASE_MS so clock skew never
      // causes two browsers to fight over the strip.
      const mine = painter?.id === meRef.current && painter.until > t;
      const remoteStale =
        !painter ||
        (painter.until <= t - (isVisible() ? 0 : LEASE_MS) &&
          (!observedPainterRef.current ||
            t - observedPainterRef.current.seenAt >= LEASE_MS));
      const wasPainting = paintingRef.current;
      paintingRef.current = Boolean(onStrip) && mine;
      tagRef.current = onStrip ? (firstSegment(state)?.n ?? null) : null;

      if (onStrip && mine && painter!.until - t < RENEW_MS) {
        await writeTag(onStrip);
      } else if (onStrip && !mine && remoteStale && !claimingRef.current) {
        claimingRef.current = true;
        try {
          const ok = await writeTag(onStrip);
          if (ok) {
            await steadySleep(CLAIM_MS);
            const verify = await read();
            const winner = painterOf(verify?.state);
            const won = winner?.id === meRef.current;
            paintingRef.current = won && Boolean(sessionOnStrip(verify?.state));
            if (paintingRef.current) {
              tagRef.current = firstSegment(verify?.state)?.n ?? tagRef.current;
              themeSnapshotRef.current = null;
              solidSetupKeyRef.current = null;
              lastPaintedRef.current = null;
            }
          }
        } finally {
          claimingRef.current = false;
        }
      }

      if (paintingRef.current !== wasPainting) pokePoll();

      // Reconcile strip segment layout against expected mode (skip for mock)
      if (onStrip && paintingRef.current && !strip.isMock && state?.seg) {
        const curSession = sessionAt(onStrip, Date.now()).session;
        const curMode = modeOf(curSession.config, curSession.phase);
        const activeSegs = state.seg.filter(
          (s) => (s.stop ?? 0) > (s.start ?? 0),
        );
        if (curMode === "theme") {
          const expected = Math.min(
            THEME_SEGMENTS,
            Math.max(1, ledCountRef.current),
          );
          if (activeSegs.length !== expected && !themeWriteInFlightRef.current) {
            themeSnapshotRef.current = null;
          }
        } else if (
          (activeSegs.some((s) => s.id > 0) ||
            firstSegment(state)?.fx !== 0) &&
          !setupInFlightRef.current
        ) {
          solidSetupKeyRef.current = null;
        }
      }

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
        if (isLeftoverFrame(after?.state)) {
          await write({
            ...unfreezePayload,
            seg: [...unfreezePayload.seg, ...extraSegsOff(after?.state)],
          });
        }
      }
    },
    [
      endSession,
      frames,
      paint,
      pokePoll,
      read,
      setAnchor,
      strip.isMock,
      write,
      writeTag,
    ],
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
        markWrite();
        const data = await read();
        if (data && !sessionOnStrip(data.state)) return; // stopped meanwhile
        const base = sessionOnStrip(data?.state) ?? anchorRef.current;
        if (!base) return;
        const t = Date.now();
        const next = asStored(fn(sessionAt(base, t).session, t));
        setAnchor(next);
        if (await writeTag(next)) paint();
      });
    },
    [markWrite, paint, read, setAnchor, writeTag],
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

      markWrite();
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
      const isTheme = modeOf(next.config, next.phase) === "theme";
      if (!isPomoState(data?.state) && !noteOf(data?.state).playing) {
        await write(saveOfficeLookPayload);
        // WLED persists psave to flash asynchronously; wait briefly before
        // overwriting segment 0 with the Pomodoro claim.
        await steadySleep(SAVE_PRESET_WAIT_MS);
        const seg0 = firstSegment(data?.state);
        if (typeof seg0?.fx === "number") {
          officeLookRef.current = officeLookOf({ 250: { seg: [seg0] } });
        }
      } else if (isTheme && !officeLookRef.current) {
        const presets = await readPresets();
        officeLookRef.current = officeLookOf(presets);
      }
      const tag = encodeTag(next, newTurn());
      lastPaintedRef.current = null;
      solidSetupKeyRef.current = null;
      themeSnapshotRef.current = null;
      const ok = await write(claimPayload(data?.state, count, tag, !isTheme));
      paintingRef.current = ok;
      tagRef.current = ok ? tag : null;
      setAnchor(next);
      setOrphaned(false);
      pokePoll();
      paint();
    },
    [
      config,
      lastWriteRef,
      markWrite,
      paint,
      pokePoll,
      read,
      readPresets,
      setAnchor,
      strip.ledCount,
      write,
    ],
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
      () => {
        setNow(Date.now());
        paint();
      },
      remainingMs % 1000 || 1000,
    );
    return () => clearSteadyTimeout(t);
  }, [isRunning, paint, paused, remainingMs]);

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
    solidSetupKeyRef.current = null;
    themeSnapshotRef.current = null;
    void (async () => {
      for (let k = 0; k < colours.length; k++) {
        if (!flashingRef.current) break;
        const stepStart = Date.now();
        const payload = solidPayload(ledCountRef.current, colours[k], k === 0);
        frames.push(k === 0 ? tagged(payload) : payload);
        await frames.idle();
        if (!flashingRef.current) break;
        const left = FLASH_STEP_MS - (Date.now() - stepStart);
        if (left > 0) await steadySleep(left);
      }
      const done = flashingRef.current;
      flashingRef.current = false;
      lastPaintedRef.current = null;
      solidSetupKeyRef.current = null;
      themeSnapshotRef.current = null;
      if (done && paintingRef.current) paint();
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
