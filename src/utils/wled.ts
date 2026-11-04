// Minimal client for the office WLED strip (JSON API over HTTP)

import {
  POMO_PREFIX,
  Session,
  decodeSession,
  encodeSession,
} from "app/utils/pomo-session";

export type Rgb = [number, number, number];

export const RED: Rgb = [255, 0, 0];
export const BLUE: Rgb = [0, 0, 255];
export const WHITE: Rgb = [255, 255, 255];
const YELLOW: Rgb = [255, 190, 0];

type WledSegment = {
  id: number;
  n?: string;
  frz?: boolean;
  fx?: number;
  col?: number[][];
  [k: string]: unknown;
};

export type WledState = {
  on?: boolean;
  bri?: number;
  seg?: WledSegment[];
  [key: string]: unknown;
};

export type WledJson = {
  state?: WledState;
  info?: { ip?: string; leds?: { count?: number } };
};

const firstSegment = (state?: WledState | null) =>
  state?.seg?.find((s) => s.id === 0);

export const isPomoState = (state?: WledState | null) =>
  Boolean(state?.seg?.some((s) => s.n?.startsWith(POMO_PREFIX)));

/**
 * While a pomodoro runs, the name is "<session>|<painter>.<until>": the one
 * browser that paints the strip, and until when (seconds, base 36). Every
 * other browser only reads, so they can't paint over each other.
 */
export type Painter = { id: string; until: number };

export const sessionOnStrip = (state?: WledState | null): Session | null =>
  decodeSession(firstSegment(state)?.n?.split("|")[0]);

export function painterOf(state?: WledState | null): Painter | null {
  const m = /\|([a-z0-9]+)\.([a-z0-9]+)$/.exec(firstSegment(state)?.n ?? "");
  return m ? { id: m[1], until: parseInt(m[2], 36) * 1000 } : null;
}

export const encodeTag = (s: Session, painter: Painter) =>
  `${encodeSession(s)}|${painter.id}.${Math.floor(painter.until / 1000).toString(36)}`;

// Our frames freeze segment 0. Frozen but untagged means a frame landed after
// someone else gave the lights back.
export const isLeftoverFrame = (state?: WledState | null) =>
  !isPomoState(state) && Boolean(firstSegment(state)?.frz);

// The office look is kept on the strip during a pomodoro, as a preset, so
// whoever ends the session puts back the same look
const OFFICE_PRESET = 250;
export const saveOfficeLookPayload = {
  psave: OFFICE_PRESET,
  n: "Kontorlys (pomodoro)",
  ib: true,
  sb: true,
};
export const loadOfficeLookPayload = { ps: OFFICE_PRESET };

/**
 * When no pomodoro runs, segment 0's name is a note every browser reads: the
 * office's effect settings and the last event shown, e.g. "Lys:bpk:p:lego#12".
 * While an event plays it starts "Lys!" instead, so that look isn't saved as
 * the office look.
 */
export type LightSettings = {
  /** Fireworks when someone with a birthday arrives */
  birthday: boolean;
  /** A green wave when a pull request is merged */
  merges: boolean;
  /** Kveld in the evening, the day look back in the morning */
  evening: boolean;
};
export type Note = {
  settings: LightSettings;
  event: string | null;
  playing: boolean;
};

const SETTING_CODE: Record<keyof LightSettings, string> = {
  birthday: "b",
  merges: "p",
  evening: "k",
};
const DEFAULT_NOTE: Note = {
  settings: { birthday: true, merges: true, evening: true },
  event: null,
  playing: false,
};

export function noteOf(state?: WledState | null): Note {
  const n = firstSegment(state)?.n ?? "";
  const m = /^Lys([:!])([a-z]*)(?::(.+))?$/.exec(n);
  if (!m) return DEFAULT_NOTE;
  const [, mark, flags, event] = m;
  const settings = Object.fromEntries(
    Object.entries(SETTING_CODE).map(([k, c]) => [k, flags.includes(c)]),
  ) as LightSettings;
  return { settings, event: event ?? null, playing: mark === "!" };
}

export function encodeNote(note: Note): string {
  const flags = Object.entries(SETTING_CODE)
    .filter(([k]) => note.settings[k as keyof LightSettings])
    .map(([, c]) => c)
    .join("");
  const event = note.event ? `:${note.event}` : "";
  return `Lys${note.playing ? "!" : ":"}${flags}${event}`.slice(0, 64);
}

/** One segment over the whole strip, extra segments off, session in the name */
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

/** Warm white, for when the saved office look is missing */
export const fallbackLookPayload: WledState = {
  on: true,
  bri: 128,
  seg: [{ id: 0, on: true, frz: false, fx: 0, col: [[255, 170, 90]], n: "" }],
};

export const lookOf = (state?: WledState | null) => {
  const seg = firstSegment(state);
  return seg ? { fx: seg.fx, col: seg.col?.[0] } : null;
};

/** Fireworks Starburst on the Party palette */
export const fireworksPayload = {
  on: true,
  bri: 200,
  transition: 5,
  seg: [{ id: 0, frz: false, fx: 89, pal: 6, sx: 150, ix: 150 }],
};

/** Puts back the look the strip had in `before`, turned on, with `note` in
 * the name */
export function restoreFrom(before: WledState | undefined, note: string) {
  const seg: Record<string, unknown> = {
    ...firstSegment(before),
    id: 0,
    frz: false,
    n: note,
  };
  delete seg.len; // read-only; WLED would take it as a new length
  return { on: true, bri: before?.bri, seg: [seg] };
}

/** The strip in `base`, with a band of `col` centred on LED `at` */
export function bandPayload(
  ledCount: number,
  base: Rgb,
  col: Rgb,
  at: number,
  width: number,
) {
  const a = Math.max(0, Math.min(ledCount, Math.round(at - width / 2)));
  const b = Math.max(0, Math.min(ledCount, Math.round(at + width / 2)));
  const i: (number | Rgb)[] = [];
  for (const [from, to, c] of [
    [0, a, base],
    [a, b, col],
    [b, ledCount, base],
  ] as [number, number, Rgb][]) {
    if (to > from) i.push(from, to, c);
  }
  return { on: true, transition: 0, seg: [{ id: 0, i }] };
}

/** Blue up to `blue`, red after, and an optional yellow pause marker around
 * `markerAt` (LED indices) */
export function progressPayload(
  ledCount: number,
  blue: number,
  markerAt: number | null,
) {
  const i: (number | Rgb)[] = [];
  const push = (a: number, b: number, col: Rgb) => {
    if (b > a) i.push(a, b, col);
  };
  const width = Math.max(12, Math.round(ledCount * 0.03));
  const tip =
    markerAt === null
      ? null
      : Math.max(
          0,
          Math.min(ledCount - width, markerAt - Math.floor(width / 2)),
        );

  for (const [a, b, col] of [
    [0, blue, BLUE],
    [blue, ledCount, RED],
  ] as [number, number, Rgb][]) {
    if (tip === null || b <= tip || a >= tip + width) {
      push(a, b, col);
    } else {
      push(a, tip, col);
      push(tip + width, b, col);
    }
  }
  if (tip !== null) push(tip, tip + width, YELLOW);
  return { on: true, transition: 0, seg: [{ id: 0, i }] };
}

/** `lit` LEDs in the middle of the strip, the rest dark */
export function growPayload(ledCount: number, lit: number, col: Rgb) {
  const a = Math.floor((ledCount - lit) / 2);
  const b = a + lit;
  const i: (number | Rgb)[] = [];
  for (const [from, to, c] of [
    [0, a, [0, 0, 0]],
    [a, b, col],
    [b, ledCount, [0, 0, 0]],
  ] as [number, number, Rgb][]) {
    if (to > from) i.push(from, to, c);
  }
  return { on: true, transition: 0, seg: [{ id: 0, i }] };
}

export const solidPayload = (ledCount: number, col: Rgb) => ({
  on: true,
  transition: 0,
  seg: [{ id: 0, i: [0, ledCount, col] }],
});

type Send = (payload: object) => Promise<void>;

/** Sends every payload, one at a time, in order */
class InOrder {
  private pending = 0;
  private last: Promise<void> = Promise.resolve();

  constructor(private readonly send: Send) {}

  get busy() {
    return this.pending > 0;
  }

  push(payload: object): Promise<void> {
    this.pending += 1;
    this.last = this.last
      .then(() => this.send(payload))
      .finally(() => {
        this.pending -= 1;
      });
    return this.last;
  }
}

/** Sends one payload at a time; while one is in flight only the newest waits */
class LatestOnly {
  private next: object | null = null;
  private running: Promise<void> | null = null;

  constructor(private readonly send: Send) {}

  push(payload: object) {
    this.next = payload;
    this.running ??= this.drain().finally(() => {
      this.running = null;
    });
  }

  /** Waits until everything queued has been sent */
  async idle() {
    await this.running;
  }

  /** Drops what is queued and waits for the request in flight */
  async settle() {
    this.next = null;
    await this.running;
  }

  private async drain() {
    while (this.next !== null) {
      const payload = this.next;
      this.next = null;
      await this.send(payload);
    }
  }
}

/**
 * Writes go as text/plain, which WLED parses as JSON, so the browser skips the
 * CORS preflight. targetAddressSpace lets Chrome reach the strip from an https
 * page once local network access is granted.
 */
export class WledClient {
  /** Session and setup writes */
  readonly state = new InOrder((p) => this.write(p));
  /** LED frames; dropping one is fine, the next repaints everything */
  readonly frames = new LatestOnly((p) => this.write(p));

  constructor(public host: string) {}

  async read(): Promise<WledJson> {
    const res = await fetch(`${this.host}/json/si`, {
      signal: AbortSignal.timeout(2500),
      targetAddressSpace: "local",
    } as RequestInit);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as WledJson;
  }

  protected async write(payload: object) {
    try {
      await fetch(`${this.host}/json/state`, {
        method: "POST",
        body: JSON.stringify({ v: false, ...payload }),
        signal: AbortSignal.timeout(1500),
        targetAddressSpace: "local",
      } as RequestInit);
    } catch {
      // The next write or poll catches up
    }
  }
}

/** A pretend strip in localStorage for ?wled=mock, shared between tabs. Like
 * WLED, a write only changes the fields it sends. */
export class MockWledClient extends WledClient {
  static readonly KEY = "wled-pomo-mock-strip";
  private static readonly FROZEN_KEY = `${MockWledClient.KEY}:frz`;
  private static readonly ON_KEY = `${MockWledClient.KEY}:on`;
  private static readonly LOOK_KEY = `${MockWledClient.KEY}:look`;
  private static readonly PRESET_KEY = `${MockWledClient.KEY}:preset`;
  private static readonly ALL_KEYS = [
    MockWledClient.KEY,
    MockWledClient.FROZEN_KEY,
    MockWledClient.ON_KEY,
    MockWledClient.LOOK_KEY,
  ];

  constructor() {
    super("mock");
  }

  override read(): Promise<WledJson> {
    const get = (key: string) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    };
    const n = get(MockWledClient.KEY) ?? "";
    const frz = get(MockWledClient.FROZEN_KEY) === "1";
    const on = get(MockWledClient.ON_KEY) !== "0";
    const look = JSON.parse(get(MockWledClient.LOOK_KEY) ?? "{}") as {
      bri?: number;
      fx?: number;
      col?: number[];
    };
    return Promise.resolve({
      state: {
        on,
        bri: look.bri ?? 128,
        seg: [
          {
            id: 0,
            n,
            frz,
            fx: look.fx ?? 0,
            col: [look.col ?? [255, 170, 90]],
          },
        ],
      },
      info: { leds: { count: 900 } },
    });
  }

  protected override write(payload: {
    on?: boolean;
    bri?: number;
    psave?: number;
    ps?: number;
    seg?: Partial<WledSegment>[];
  }) {
    const seg = payload.seg?.find((s) => s.id === 0);
    try {
      const keys = MockWledClient.ALL_KEYS;
      if (payload.psave) {
        const saved = keys.map((k) => localStorage.getItem(k));
        localStorage.setItem(MockWledClient.PRESET_KEY, JSON.stringify(saved));
        return Promise.resolve();
      }
      if (payload.ps) {
        const saved = JSON.parse(
          localStorage.getItem(MockWledClient.PRESET_KEY) ?? "null",
        ) as (string | null)[] | null;
        saved?.forEach((v, i) =>
          v === null
            ? localStorage.removeItem(keys[i])
            : localStorage.setItem(keys[i], v),
        );
        return Promise.resolve();
      }
      // Only touched when the write changes the look, like on a real strip
      if (
        typeof payload.bri === "number" ||
        seg?.fx !== undefined ||
        seg?.col
      ) {
        const look = JSON.parse(
          localStorage.getItem(MockWledClient.LOOK_KEY) ?? "{}",
        ) as Record<string, unknown>;
        if (typeof payload.bri === "number") look.bri = payload.bri;
        if (typeof seg?.fx === "number") look.fx = seg.fx;
        if (seg?.col) look.col = seg.col[0];
        localStorage.setItem(MockWledClient.LOOK_KEY, JSON.stringify(look));
      }
      if (typeof payload.on === "boolean")
        localStorage.setItem(MockWledClient.ON_KEY, payload.on ? "1" : "0");
      if (typeof seg?.n === "string")
        localStorage.setItem(MockWledClient.KEY, seg.n);
      if (seg?.i) localStorage.setItem(MockWledClient.FROZEN_KEY, "1");
      if (seg?.frz === false)
        localStorage.setItem(MockWledClient.FROZEN_KEY, "0");
    } catch {
      // Ignore
    }
    return Promise.resolve();
  }
}
