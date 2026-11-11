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

/** WLED forgets a segment's name when a write moves its start or stop without
 * one. Segment 0's name holds the session, so frames that may move it carry
 * the tag along. */
export const withTag = <P extends { seg: readonly { id: number }[] }>(
  payload: P,
  tag: string,
) => ({
  ...payload,
  seg: payload.seg.map((s) => (s.id === 0 ? { ...s, n: tag } : s)),
});

export const unfreezePayload = { seg: [{ id: 0, frz: false }] };

// A twinkling pomodoro draws its eaten part in a second segment
const EATEN_SEG = 1;
export const noEatenSeg = { id: EATEN_SEG, stop: 0 };

// The office look waits on the strip as a preset during a pomodoro
const OFFICE_PRESET = 250;
export const saveOfficeLookPayload = {
  psave: OFFICE_PRESET,
  n: "Kontorlys (pomodoro)",
  ib: true,
  sb: true,
};
export const loadOfficeLookPayload = {
  ps: OFFICE_PRESET,
  seg: [{ id: 0, start: 0, frz: false, rev: false }, noEatenSeg],
};

/** The office look's effect, as saved in its preset */
export type OfficeLook = {
  fx: number;
  col?: Rgb[];
  [setting: string]: unknown;
};
// What the look keeps when tinted: its motion, not its colours
const LOOK_SETTINGS = ["sx", "ix", "c1", "c2", "c3", "o1", "o2", "o3"];
// Twinklefox, as in the Jul look, when no office look is saved
const FALLBACK_OFFICE_LOOK: OfficeLook = { fx: 80, sx: 90, ix: 170 };

/** The office look from the strip's presets, or a twinkle without one */
export function officeLookOf(presets: unknown): OfficeLook {
  const preset = (presets as Record<string, { seg?: unknown }> | null)?.[
    OFFICE_PRESET
  ];
  const seg = Array.isArray(preset?.seg)
    ? (preset.seg as Partial<OfficeLook>[]).find(
        (s) => typeof s?.fx === "number",
      )
    : undefined;
  return seg ? (seg as OfficeLook) : FALLBACK_OFFICE_LOOK;
}

export const fallbackLookPayload: WledState = {
  on: true,
  bri: 230,
  seg: [
    {
      id: 0,
      start: 0,
      on: true,
      frz: false,
      rev: false,
      fx: 0,
      col: [OFFICE_WHITE],
      n: "",
    },
    { id: 1, stop: 0 },
  ],
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

export const solidPayload = (ledCount: number, col: Rgb) => ({
  transition: 0,
  seg: [
    { id: 0, start: 0, stop: ledCount, rev: false, i: [0, ledCount, col] },
    noEatenSeg,
  ],
});

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
  return progress; // "bar", and "theme" in the dashboard
}

/** Green eats the phase's colour: red in work, blue in a break */
export const phaseColours = (phase: Phase): [Rgb, Rgb] =>
  phase === "work" ? [GREEN, RED] : [GREEN, BLUE];

const progressAt = (stored: Session, now: number) => {
  const { session } = sessionAt(stored, now);
  const duration = durationOf(session.config, session.phase);
  const left = remainingOf(session, now);
  const progress = Math.min(1, Math.max(0, (duration - left) / duration));
  return { session, progress };
};

/** Every phase is eaten from the left by green */
export function frameFor(stored: Session, now: number, ledCount: number) {
  const { session, progress } = progressAt(stored, now);
  const shown = shownProgress(progress, modeOf(session.config, session.phase));
  const filled = Math.round(shown * ledCount);
  const raw = Math.round(progress * ledCount);
  const [fill, rest] = phaseColours(session.phase);
  const payload = progressPayload(
    ledCount,
    filled,
    session.endsAt === null ? raw : null,
    fill,
    rest,
  );
  // Solid again, and one segment, after a twinkling phase
  return {
    ...payload,
    seg: [
      { ...payload.seg[0], start: 0, stop: ledCount, fx: 0, rev: false },
      noEatenSeg,
    ] as const,
  };
}

/** Like frameFor, but each part twinkles in its colour, as the office look
 * moves. A solid look twinkles like the Jul look instead. */
export function themeFrameFor(
  stored: Session,
  now: number,
  ledCount: number,
  look: OfficeLook,
) {
  const { session, progress } = progressAt(stored, now);
  const eaten = Math.round(progress * ledCount);
  const moving = look.fx === 0 ? FALLBACK_OFFICE_LOOK : look;
  const motion = Object.fromEntries(
    LOOK_SETTINGS.filter((k) => moving[k] !== undefined).map((k) => [
      k,
      moving[k],
    ]),
  );
  // "* Color 1" keeps the effect's own palette to one colour. As background
  // (Twinklefox dims it) the same colour, so each part glows faintly in it.
  const twinkle = (c: Rgb) => ({
    on: true,
    frz: false,
    ...motion,
    fx: moving.fx,
    pal: 2,
    col: [c, c, BLACK],
  });
  const [fill, rest] = phaseColours(session.phase);

  if (eaten <= 0) {
    const all = {
      id: 0,
      start: 0,
      stop: ledCount,
      rev: true,
      ...twinkle(rest),
    };
    return {
      transition: 0,
      seg: [all, noEatenSeg] as [typeof all, typeof noEatenSeg],
    };
  }
  if (eaten >= ledCount) {
    const all = {
      id: 0,
      start: 0,
      stop: ledCount,
      rev: false,
      ...twinkle(fill),
    };
    return {
      transition: 0,
      seg: [all, noEatenSeg] as [typeof all, typeof noEatenSeg],
    };
  }

  // Non-overlapping segments prevent the green strip from flashing red.
  // restPart is reversed so pixels are indexed from stop (ledCount), meaning
  // moving start (eaten) never shifts the relative indices of remaining LEDs.
  const restPart = {
    id: 0,
    start: eaten,
    stop: ledCount,
    rev: true,
    ...twinkle(rest),
  };
  const eatenPart = {
    id: EATEN_SEG,
    start: 0,
    stop: eaten,
    rev: false,
    ...twinkle(fill),
  };
  return {
    transition: 0,
    seg: [restPart, eatenPart] as [typeof restPart, typeof eatenPart],
  };
}
