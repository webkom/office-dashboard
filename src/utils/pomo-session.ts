// The shared pomodoro, stored in the strip's segment name so every browser
// sees the same session. Phases that run out are rolled forward from the
// settings, so the strip is only written when someone changes something.

export type DisplayMode = "bar" | "quarters" | "solid";
export const DISPLAY_MODES: DisplayMode[] = ["bar", "quarters", "solid"];

export type Phase = "work" | "break" | "long-break";

export type SessionConfig = {
  workMs: number;
  breakMs: number;
  longBreakMs: number | null;
  longBreakEvery: number;
  displayMode: DisplayMode;
};

export type Session = {
  config: SessionConfig;
  startedAt: number;
  phase: Phase;
  cycle: number;
  /** null while paused */
  endsAt: number | null;
  pausedLeftMs: number | null;
};

/** A forgotten session stops on its own after this long */
export const MAX_SESSION_MS = 8 * 60 * 60 * 1000;

// Older versions wrote just "Pomodoro", so any name starting with it means
// the strip is in pomodoro mode
export const POMO_PREFIX = "Pomodoro";
const VERSION = "1";

const PHASE_CODE: Record<Phase, string> = {
  work: "w",
  break: "b",
  "long-break": "l",
};
const MODE_CODE: Record<DisplayMode, string> = {
  bar: "b",
  quarters: "q",
  solid: "s",
};

// Rounded down, so a fresh phase never shows more than its length
const sec36 = (ms: number) => Math.floor(ms / 1000).toString(36);
const fromSec36 = (s: string) => parseInt(s, 36) * 1000;
const keyOf = <T extends string>(map: Record<T, string>, code: string) =>
  (Object.keys(map) as T[]).find((k) => map[k] === code);

/**
 * Pomodoro:1:<start>:<phase><round>:<end | p<left>>:<mode><every>:<work>:<break>:<long>
 * Times are whole seconds in base 36, which keeps it under WLED's 64 chars.
 */
export function encodeSession(s: Session): string {
  const c = s.config;
  return [
    POMO_PREFIX,
    VERSION,
    sec36(s.startedAt),
    PHASE_CODE[s.phase] + s.cycle.toString(36),
    s.endsAt === null ? `p${sec36(s.pausedLeftMs ?? 0)}` : sec36(s.endsAt),
    MODE_CODE[c.displayMode] + c.longBreakEvery.toString(36),
    sec36(c.workMs),
    sec36(c.breakMs),
    c.longBreakMs ? sec36(c.longBreakMs) : "",
  ].join(":");
}

export function decodeSession(name: string | undefined): Session | null {
  const parts = name?.split(":") ?? [];
  if (parts.length !== 9 || parts[0] !== POMO_PREFIX || parts[1] !== VERSION)
    return null;
  const [, , start, phaseCycle, end, modeEvery, work, brk, long] = parts;
  const phase = keyOf(PHASE_CODE, phaseCycle[0]);
  const displayMode = keyOf(MODE_CODE, modeEvery[0]);
  if (!phase || !displayMode) return null;
  const paused = end.startsWith("p");
  const s: Session = {
    config: {
      workMs: fromSec36(work),
      breakMs: fromSec36(brk),
      longBreakMs: long ? fromSec36(long) : null,
      longBreakEvery: parseInt(modeEvery.slice(1), 36),
      displayMode,
    },
    startedAt: fromSec36(start),
    phase,
    cycle: parseInt(phaseCycle.slice(1), 36),
    endsAt: paused ? null : fromSec36(end),
    pausedLeftMs: paused ? fromSec36(end.slice(1)) : null,
  };
  const valid =
    [
      s.startedAt,
      s.cycle,
      s.config.longBreakMs ?? 0,
      s.endsAt ?? s.pausedLeftMs,
    ].every(Number.isFinite) &&
    s.config.workMs >= 1000 &&
    s.config.breakMs >= 1000 &&
    s.config.longBreakEvery >= 1;
  return valid ? s : null;
}

export const sameSession = (a: Session | null, b: Session | null) =>
  (a && encodeSession(a)) === (b && encodeSession(b));

export const durationOf = (c: SessionConfig, phase: Phase) =>
  phase === "work"
    ? c.workMs
    : phase === "long-break"
      ? (c.longBreakMs ?? c.breakMs)
      : c.breakMs;

export function nextPhase(s: Session, at: number): Session {
  const c = s.config;
  const phase: Phase =
    s.phase !== "work"
      ? "work"
      : c.longBreakMs && s.cycle % c.longBreakEvery === 0
        ? "long-break"
        : "break";
  return {
    ...s,
    phase,
    cycle: phase === "work" ? s.cycle + 1 : s.cycle,
    endsAt: at + durationOf(c, phase),
    pausedLeftMs: null,
  };
}

/** The session at `now`. `rolled` is true when a phase ran out since the
 * stored one, rather than being set by someone. */
export function sessionAt(s: Session, now: number) {
  let cur = s;
  let rolled = false;
  for (let k = 0; k < 10_000 && cur.endsAt !== null && cur.endsAt <= now; k++) {
    cur = nextPhase(cur, cur.endsAt);
    rolled = true;
  }
  return { session: cur, rolled };
}

export const remainingOf = (s: Session, now: number) =>
  s.endsAt === null ? (s.pausedLeftMs ?? 0) : s.endsAt - now;

export const isExpired = (s: Session, now: number) =>
  now - s.startedAt > MAX_SESSION_MS;

export const startSession = (config: SessionConfig, now: number): Session => ({
  config,
  startedAt: now,
  phase: "work",
  cycle: 1,
  endsAt: now + config.workMs,
  pausedLeftMs: null,
});

export function togglePause(s: Session, now: number): Session {
  return s.endsAt === null
    ? { ...s, endsAt: now + (s.pausedLeftMs ?? 0), pausedLeftMs: null }
    : { ...s, endsAt: null, pausedLeftMs: Math.max(0, s.endsAt - now) };
}

export function restartPhase(s: Session, now: number): Session {
  const full = durationOf(s.config, s.phase);
  return s.endsAt === null
    ? { ...s, pausedLeftMs: full }
    : { ...s, endsAt: now + full };
}

/** One minute per step, or a tenth of very short (test) phases */
export function scrub(s: Session, now: number, dir: 1 | -1): Session {
  const full = durationOf(s.config, s.phase);
  const step =
    full <= 120_000 ? Math.max(1000, Math.round(full * 0.1)) : 60_000;
  const left = Math.max(500, Math.min(full, remainingOf(s, now) - dir * step));
  return s.endsAt === null
    ? { ...s, pausedLeftMs: left }
    : { ...s, endsAt: now + left };
}
