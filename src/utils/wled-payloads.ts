import {
  DisplayMode,
  Phase,
  Session,
  durationOf,
  modeOf,
  remainingOf,
  sessionAt,
} from "app/utils/pomo-session";
import type { WledSegment, WledState } from "app/utils/wled-client";

export type Rgb = [number, number, number];

export const RED: Rgb = [255, 0, 0];
export const BLUE: Rgb = [0, 0, 255];
export const GREEN: Rgb = [0, 255, 60];
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
// Frames don't switch the strip on, so lights switched off stay off, even
// with a pomodoro painting
const frame = (i: (number | Rgb)[]) => ({
  transition: 0,
  seg: [{ id: 0, i }],
});

// The whole strip lit in solid colour draws a lot of current; at full
// brightness enough to make the strip restart. Brighter is a dimmer away.
export const POMO_BRI = 128;

export function claimPayload(
  state: WledState | undefined,
  ledCount: number,
  tag: string,
) {
  // Deleted, not turned off: an off segment still paints its LEDs black over
  // ours. The office look keeps them, and brings them back afterwards.
  const extraSegs = (state?.seg ?? [])
    .filter((s) => s.id > 0)
    .map((s) => ({ id: s.id, stop: 0 }));
  return {
    on: true,
    bri: Math.min(state?.bri ?? POMO_BRI, POMO_BRI),
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

/** Turning on, lit from the centre outwards */
export function growPayload(ledCount: number, lit: number, col: Rgb) {
  const a = Math.floor((ledCount - lit) / 2);
  const b = a + lit;
  return {
    on: true,
    ...frame(
      ranges([
        [0, a, BLACK],
        [a, b, col],
        [b, ledCount, BLACK],
      ]),
    ),
  };
}

export const solidPayload = (ledCount: number, col: Rgb) =>
  frame([0, ledCount, col]);

/** `fill` up to `filled`, `rest` after, and a yellow marker at `markerAt` */
export function progressPayload(
  ledCount: number,
  filled: number,
  markerAt: number | null,
  fill: Rgb = BLUE,
  rest: Rgb = RED,
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
    [0, filled, fill],
    [filled, ledCount, rest],
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

/** The colour that fills the strip in a phase, and the one it fills over.
 * Work fills blue over red; a break fills green over the blue work left. */
export const phaseColours = (phase: Phase): [Rgb, Rgb] =>
  phase === "work" ? [BLUE, RED] : [GREEN, BLUE];

/** Every phase fills the strip from the left; its colour tells which it is */
export function frameFor(stored: Session, now: number, ledCount: number) {
  const { session } = sessionAt(stored, now);
  const duration = durationOf(session.config, session.phase);
  const left = remainingOf(session, now);
  const progress = Math.min(1, Math.max(0, (duration - left) / duration));
  const shown = shownProgress(progress, modeOf(session.config, session.phase));
  const filled = Math.round(shown * ledCount);
  const raw = Math.round(progress * ledCount);
  const [fill, rest] = phaseColours(session.phase);
  return progressPayload(
    ledCount,
    filled,
    session.endsAt === null ? raw : null,
    fill,
    rest,
  );
}
