import { OFFICE_WHITE, Rgb } from "app/utils/wled-payloads";

export type LightPreset = {
  id: string;
  name: string;
  bri: number;
  fx: number;
  col: Rgb;
  /** Colours after the first. Some effects use the second as background. */
  more?: Rgb[];
  pal?: number;
  sx?: number;
  ix?: number;
  shown: Rgb;
};

// Effect ids from the strip's /json/eff (WLED 0.15)
export const LIGHT_PRESETS: LightPreset[] = [
  {
    id: "white",
    name: "Hvit",
    bri: 230,
    fx: 0,
    col: OFFICE_WHITE,
    shown: OFFICE_WHITE,
  },
  // Aurora on its own palette, slowed right down: always moving, never busy
  {
    id: "focus",
    name: "Fokus",
    bri: 150,
    fx: 38,
    col: [40, 200, 160],
    pal: 50,
    sx: 24,
    ix: 96,
    shown: [60, 200, 170],
  },
  {
    id: "evening",
    name: "Kveld",
    bri: 70,
    fx: 88,
    col: [255, 110, 30],
    sx: 96,
    ix: 224,
    shown: [255, 120, 40],
  },
  // Red, gold and spruce-green twinkles over a warm glow: Twinklefox on
  // "Colors Only", which twinkles in the three colours, with the gold as glow
  {
    id: "christmas",
    name: "Jul",
    bri: 200,
    fx: 80,
    col: [255, 0, 0],
    more: [
      [255, 150, 70],
      [0, 220, 35],
    ],
    pal: 5,
    sx: 90,
    ix: 170,
    shown: [230, 60, 50],
  },
  // Needs sound: it is dark in a quiet room
  {
    id: "music",
    name: "Musikk",
    bri: 200,
    fx: 156,
    col: [255, 0, 200],
    pal: 6,
    sx: 128,
    ix: 128,
    shown: [255, 60, 200],
  },
];

export const presetOfId = (id: string) =>
  LIGHT_PRESETS.find((p) => p.id === id) ?? LIGHT_PRESETS[0];

export const presetPayload = (p: LightPreset, transition = 7) => ({
  on: true,
  bri: p.bri,
  transition,
  seg: [
    {
      id: 0,
      frz: false,
      fx: p.fx,
      col: [p.col, ...(p.more ?? [])],
      pal: p.pal ?? 0,
      sx: p.sx ?? 128,
      ix: p.ix ?? 128,
    },
  ],
});

const sameRgb = (a?: number[], b?: number[]) =>
  Boolean(a && b) && a!.slice(0, 3).every((v, i) => v === b![i]);

// Effects are told apart by effect alone, since some ignore the colour
export const presetOf = (look: { fx?: number; col?: number[] } | null) =>
  look
    ? (LIGHT_PRESETS.find(
        (p) => p.fx === look.fx && (p.fx !== 0 || sameRgb(p.col, look.col)),
      ) ?? null)
    : null;
