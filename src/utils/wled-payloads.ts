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
  withFx = true,
) {
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
        frz: false,
        bri: 255,
        ...(withFx ? { fx: 0 } : {}),
        n: tag,
      },
      ...extraSegsOff(state),
    ],
  };
}

export const tagPayload = (tag: string) => ({
  transition: 0,
  seg: [{ id: 0, n: tag }],
});

/** WLED forgets a segment's name when a write moves its start or stop without
 * one. Segment 0's name holds the session, so frames that may move it carry
 * the tag along. */
export const withTag = <P extends { seg: { id: number }[] }>(
  payload: P,
  tag: string,
) => ({
  ...payload,
  seg: payload.seg.map((s) => (s.id === 0 ? { ...s, n: tag } : s)),
});

export const unfreezePayload = {
  transition: 0,
  seg: [{ id: 0, frz: false }],
};

// A twinkling pomodoro uses up to THEME_SEGMENTS fixed segments (0..15) so
// segment bounds never move mid-phase and WLED never resets the running effect.
export const THEME_SEGMENTS = 16;
export const noExtraSegs = Array.from(
  { length: THEME_SEGMENTS - 1 },
  (_, k) => ({ id: k + 1, stop: 0 }),
);
export function extraSegsOff(state?: WledState | null) {
  const ids = new Set<number>(noExtraSegs.map((s) => s.id));
  for (const s of state?.seg ?? []) if (s.id > 0) ids.add(s.id);
  return Array.from(ids, (id) => ({ id, stop: 0 }));
}

// The office look waits on the strip as a preset during a pomodoro
export const OFFICE_PRESET = 250;
export const saveOfficeLookPayload = {
  psave: OFFICE_PRESET,
  n: "Kontorlys (pomodoro)",
  ib: true,
  sb: true,
};
export const loadOfficeLookPayload = {
  transition: 0,
  ps: OFFICE_PRESET,
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

export const fallbackLookFor = (ledCount: number): WledState => ({
  on: true,
  bri: 230,
  transition: 0,
  seg: [
    {
      id: 0,
      start: 0,
      stop: ledCount,
      on: true,
      frz: false,
      rev: false,
      fx: 0,
      col: [OFFICE_WHITE],
      n: "",
    },
    ...noExtraSegs,
  ],
});

export const fallbackLookPayload: WledState = fallbackLookFor(900);

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

export const solidPayload = (ledCount: number, col: Rgb, fullSetup = true) => ({
  transition: 0,
  seg: fullSetup
    ? [
        {
          id: 0,
          start: 0,
          stop: ledCount,
          fx: 0,
          rev: false,
          i: [0, ledCount, col],
        },
        ...noExtraSegs,
      ]
    : [{ id: 0, i: [0, ledCount, col] }],
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

/** Every phase is eaten from the left by green. When `fullSetup` is false, only
 * the pixel buffer `i` is sent so WLED never re-applies `fx: 0` or flashes. */
export function frameFor(
  stored: Session,
  now: number,
  ledCount: number,
  fullSetup = true,
) {
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
  if (!fullSetup) return payload;
  // Solid again, and one segment, after a twinkling phase
  return {
    ...payload,
    seg: [
      { ...payload.seg[0], start: 0, stop: ledCount, fx: 0, rev: false },
      ...noExtraSegs,
    ],
  };
}

/** Dimmed colour used as resting background so twinkles have clear contrast */
export const dimRgb = (c: Rgb, factor = 0.12): Rgb => [
  Math.round(c[0] * factor),
  Math.round(c[1] * factor),
  Math.round(c[2] * factor),
];

export type ThemeSegment = {
  id: number;
  start: number;
  stop: number;
  rev: boolean;
  bri: number;
  on: boolean;
  frz: boolean;
  fx: number;
  pal: number;
  col: [Rgb, Rgb, Rgb];
  [setting: string]: unknown;
};

/** Like frameFor, but splits the strip into fixed segments that twinkle in
 * their colours, as the office look moves. A solid or sound-reactive look
 * twinkles like the Jul look instead. Fixed segment bounds mean WLED never
 * resets the effect. */
export function themeFrameFor(
  stored: Session,
  now: number,
  ledCount: number,
  look: OfficeLook,
  segmentCount = THEME_SEGMENTS,
) {
  const { session, progress } = progressAt(stored, now);
  const count = Math.max(1, Math.min(segmentCount, Math.max(1, ledCount)));
  const eaten = progress >= 1 ? count : Math.floor(progress * count);
  // Solid (0) and sound-reactive Musikk (156) fall back to Twinklefox
  const moving =
    look.fx === 0 || look.fx === 156 ? FALLBACK_OFFICE_LOOK : look;
  const motion = Object.fromEntries(
    LOOK_SETTINGS.filter((k) => moving[k] !== undefined).map((k) => [
      k,
      moving[k],
    ]),
  );
  // "* Color 1" keeps the effect's palette to col[0], while col[1] is a dimmed
  // background glow so twinkles remain visible instead of washing out solid.
  const twinkle = (c: Rgb) => ({
    on: true,
    frz: false,
    bri: 255,
    ...motion,
    fx: moving.fx,
    pal: 2,
    col: [c, dimRgb(c), BLACK] as [Rgb, Rgb, Rgb],
  });
  const [fill, rest] = phaseColours(session.phase);
  const seg: ThemeSegment[] = Array.from({ length: count }, (_, id) => ({
    id,
    start: Math.round((id * ledCount) / count),
    stop: Math.round(((id + 1) * ledCount) / count),
    rev: false,
    ...twinkle(id < eaten ? fill : rest),
  }));
  return {
    transition: 0,
    seg,
  };
}

export type ThemeSnapshot = {
  setupKey: string;
  colors: string[];
};

function themeSetupKey(
  ledCount: number,
  frame: ReturnType<typeof themeFrameFor>,
) {
  const first = frame.seg[0];
  return JSON.stringify({
    ledCount,
    count: frame.seg.length,
    fx: first.fx,
    motion: LOOK_SETTINGS.map((k) => first[k]),
  });
}

/**
 * Returns the minimal update needed for `frame`: the full setup payload when
 * segments aren't initialized yet (requiring the session tag on segment 0), or
 * a color-only diff when only eaten progress/phase colors changed, or `null`
 * when nothing on the strip changed.
 */
export function themePatchFor(
  prev: ThemeSnapshot | null,
  ledCount: number,
  frame: ReturnType<typeof themeFrameFor>,
): {
  payload: { transition: number; seg: WledSegment[] } | null;
  snapshot: ThemeSnapshot;
  needsTag: boolean;
} {
  const setupKey = themeSetupKey(ledCount, frame);
  const colors = frame.seg.map((s) => s.col[0].join(","));
  const snapshot = { setupKey, colors };
  if (
    !prev ||
    prev.setupKey !== setupKey ||
    prev.colors.length !== colors.length
  ) {
    return { payload: frame, snapshot, needsTag: true };
  }
  const changed = frame.seg
    .filter((_, idx) => colors[idx] !== prev.colors[idx])
    .map((s) => ({ id: s.id, col: s.col }));
  if (changed.length === 0) {
    return { payload: null, snapshot, needsTag: false };
  }
  return {
    payload: { transition: 0, seg: changed },
    snapshot,
    needsTag: false,
  };
}
