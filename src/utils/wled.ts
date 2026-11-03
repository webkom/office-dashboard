// Minimal client for the office WLED strip (JSON API over HTTP)

import { POMO_PREFIX, Session, decodeSession } from "app/utils/pomo-session";

export type Rgb = [number, number, number];

export const RED: Rgb = [255, 0, 0];
export const BLUE: Rgb = [0, 0, 255];
export const WHITE: Rgb = [255, 255, 255];
const YELLOW: Rgb = [255, 190, 0];

type WledSegment = {
  id: number;
  n?: string;
  frz?: boolean;
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

export const sessionOnStrip = (state?: WledState | null): Session | null =>
  decodeSession(firstSegment(state)?.n);

// Our frames freeze segment 0. Frozen but untagged means a frame landed after
// someone else gave the lights back.
export const isLeftoverFrame = (state?: WledState | null) =>
  !isPomoState(state) && Boolean(firstSegment(state)?.frz);

// The strip only has room for the session, so each browser remembers the
// office look it last saw, to put back when a session ends
const OFFICE_STATE_KEY = "wled-pomo-office-state";
const FALLBACK_OFFICE_STATE: WledState = {
  on: true,
  bri: 128,
  seg: [{ id: 0, on: true, fx: 0, col: [[255, 170, 90]] }],
};

export function rememberOfficeState(state?: WledState) {
  if (!state || isPomoState(state) || isLeftoverFrame(state)) return;
  try {
    localStorage.setItem(OFFICE_STATE_KEY, JSON.stringify(state));
  } catch {
    // Best effort
  }
}

function recalledOfficeState(): WledState {
  try {
    const raw = localStorage.getItem(OFFICE_STATE_KEY);
    if (raw) return JSON.parse(raw) as WledState;
  } catch {
    // Fall through
  }
  return FALLBACK_OFFICE_STATE;
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

export function restorePayload(): WledState {
  const restored = structuredClone(recalledOfficeState());
  // n: "" clears our tag when the segment had no name
  restored.seg = restored.seg?.map((s) => ({ ...s, frz: false, n: s.n ?? "" }));
  return restored;
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
    return Promise.resolve({
      state: { on: true, bri: 128, seg: [{ id: 0, n, frz }] },
      info: { leds: { count: 900 } },
    });
  }

  protected override write(payload: { seg?: Partial<WledSegment>[] }) {
    const seg = payload.seg?.find((s) => s.id === 0);
    try {
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
