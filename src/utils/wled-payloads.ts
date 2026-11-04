import {
  DisplayMode,
  Session,
  durationOf,
  remainingOf,
  sessionAt,
} from "app/utils/pomo-session";
import type { WledSegment, WledState } from "app/utils/wled-client";

export type Rgb = [number, number, number];

export const RED: Rgb = [255, 0, 0];
export const BLUE: Rgb = [0, 0, 255];
export const WHITE: Rgb = [255, 255, 255];
const YELLOW: Rgb = [255, 190, 0];
const BLACK: Rgb = [0, 0, 0];
/** A touch warm, since RGB-only LEDs look bluish at full white */
export const OFFICE_WHITE: Rgb = [255, 244, 230];

const ranges = (parts: [number, number, Rgb][]) => {
  const i: (number | Rgb)[] = [];
  for (const [from, to, col] of parts) if (to > from) i.push(from, to, col);
  return i;
};
const frame = (i: (number | Rgb)[]) => ({
  on: true,
  transition: 0,
  seg: [{ id: 0, i }],
});

export function claimPayload(
  state: WledState | undefined,
  ledCount: number,
  tag: string,
) {
  const extraSegs = (state?.seg ?? [])
    .filter((s) => s.id > 0)
    .map((s) => ({ id: s.id, on: false }));
  return {
    on: true,
    bri: 255,
    transition: 0,
    mainseg: 0,
    seg: [
      {
        id: 0,
        start: 0,
        stop: ledCount,
        grp: 1,
        spc: 0,
        of: 0,
        on: true,
        bri: 255,
        fx: 0,
        n: tag,
      },
      ...extraSegs,
    ],
  };
}

export const tagPayload = (tag: string) => ({ seg: [{ id: 0, n: tag }] });

export const unfreezePayload = { seg: [{ id: 0, frz: false }] };

// The office look waits on the strip as a preset during a pomodoro
const OFFICE_PRESET = 250;
export const saveOfficeLookPayload = {
  psave: OFFICE_PRESET,
  n: "Kontorlys (pomodoro)",
  ib: true,
  sb: true,
};
export const loadOfficeLookPayload = { ps: OFFICE_PRESET };

export const fallbackLookPayload: WledState = {
  on: true,
  bri: 230,
  seg: [{ id: 0, on: true, frz: false, fx: 0, col: [OFFICE_WHITE], n: "" }],
};

// Fireworks Starburst on the Party palette
export const fireworksPayload = {
  on: true,
  bri: 200,
  transition: 5,
  seg: [{ id: 0, frz: false, fx: 89, pal: 6, sx: 150, ix: 150 }],
};

export function restoreFrom(
  before: WledState | undefined,
  note: string,
): WledState {
  const seg: WledSegment = {
    ...before?.seg?.find((s) => s.id === 0),
    id: 0,
    frz: false,
    n: note,
  };
  delete seg.len; // read-only; WLED would take it as a new length
  return { on: true, bri: before?.bri, seg: [seg] };
}

export function bandPayload(
  ledCount: number,
  base: Rgb,
  col: Rgb,
  at: number,
  width: number,
) {
  const clamp = (x: number) => Math.max(0, Math.min(ledCount, Math.round(x)));
  const a = clamp(at - width / 2);
  const b = clamp(at + width / 2);
  return frame(
    ranges([
      [0, a, base],
      [a, b, col],
      [b, ledCount, base],
    ]),
  );
}

export function growPayload(ledCount: number, lit: number, col: Rgb) {
  const a = Math.floor((ledCount - lit) / 2);
  const b = a + lit;
  return frame(
    ranges([
      [0, a, BLACK],
      [a, b, col],
      [b, ledCount, BLACK],
    ]),
  );
}

export const solidPayload = (ledCount: number, col: Rgb) =>
  frame([0, ledCount, col]);

/** Blue up to `blue`, red after, and a yellow marker at `markerAt` */
export function progressPayload(
  ledCount: number,
  blue: number,
  markerAt: number | null,
) {
  const width = Math.max(12, Math.round(ledCount * 0.03));
  const tip =
    markerAt === null
      ? null
      : Math.max(
          0,
          Math.min(ledCount - width, markerAt - Math.floor(width / 2)),
        );

  const parts: [number, number, Rgb][] = [];
  for (const [a, b, col] of [
    [0, blue, BLUE],
    [blue, ledCount, RED],
  ] as [number, number, Rgb][]) {
    if (tip === null || b <= tip || a >= tip + width) {
      parts.push([a, b, col]);
    } else {
      parts.push([a, tip, col], [tip + width, b, col]);
    }
  }
  if (tip !== null) parts.push([tip, tip + width, YELLOW]);
  return frame(ranges(parts));
}

export function shownProgress(progress: number, mode: DisplayMode): number {
  if (progress >= 1) return 1;
  if (mode === "quarters") return Math.floor(progress * 4) / 4;
  if (mode === "solid") return 0;
  return progress;
}

/** Work fills the strip with blue, a break drains it */
export function frameFor(stored: Session, now: number, ledCount: number) {
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
