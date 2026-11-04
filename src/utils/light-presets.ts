import { Rgb } from "app/utils/wled";

export type LightPreset = {
  id: string;
  name: string;
  bri: number;
  fx: number;
  col: Rgb;
  pal?: number;
  sx?: number;
  ix?: number;
  /** For the brightness bar while the preset is on */
  shown: Rgb;
};

// Effect ids from the strip's /json/eff (WLED 0.15)
export const LIGHT_PRESETS: LightPreset[] = [
  {
    id: "warm",
    name: "Varm",
    bri: 140,
    fx: 0,
    col: [255, 170, 90],
    shown: [255, 170, 90],
  },
  {
    id: "focus",
    name: "Fokus",
    bri: 210,
    fx: 0,
    col: [205, 220, 255],
    shown: [205, 220, 255],
  },
  {
    id: "sea",
    name: "Hav",
    bri: 150,
    fx: 101,
    col: [0, 90, 255],
    sx: 100,
    shown: [40, 140, 220],
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
  {
    id: "party",
    name: "Fest",
    bri: 180,
    fx: 9,
    col: [255, 0, 0],
    sx: 110,
    ix: 128,
    shown: [230, 90, 255],
  }, // Needs sound: it is dark in a quiet room
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
      col: [p.col],
      pal: p.pal ?? 0,
      sx: p.sx ?? 128,
      ix: p.ix ?? 128,
    },
  ],
});

const sameRgb = (a?: number[], b?: number[]) =>
  Boolean(a && b) && a!.slice(0, 3).every((v, i) => v === b![i]);

/** The preset the strip is showing, if any. Effects are told apart by effect
 * alone, since some of them ignore the colour. */
export const presetOf = (look: { fx?: number; col?: number[] } | null) =>
  look
    ? (LIGHT_PRESETS.find(
        (p) => p.fx === look.fx && (p.fx !== 0 || sameRgb(p.col, look.col)),
      ) ?? null)
    : null;
