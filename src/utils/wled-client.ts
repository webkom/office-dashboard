import { OFFICE_WHITE } from "app/utils/wled-payloads";

export type WledSegment = {
  id: number;
  start?: number;
  stop?: number;
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

export const firstSegment = (state?: WledState | null) =>
  state?.seg?.find((s) => s.id === 0);

export const lookOf = (state?: WledState | null) => {
  const seg = firstSegment(state);
  return seg ? { fx: seg.fx, col: seg.col?.[0] } : null;
};
export type Look = ReturnType<typeof lookOf>;

// Only settings carry over; LED frames ("i") and preset commands don't
const NOT_STATE = ["i", "psave", "ps", "v", "transition", "tt", "ib", "sb"];

/** `state` after writing `payload`, merged the way WLED does */
export function applyWrite(
  state: WledState | undefined,
  payload: WledState,
): WledState {
  const keep = (o: object) =>
    Object.fromEntries(
      Object.entries(o).filter(
        ([k, v]) => !NOT_STATE.includes(k) && v !== undefined,
      ),
    );
  const next: WledState = { ...state, ...keep(payload) };
  if (payload.seg) {
    const segs = [...(state?.seg ?? [])];
    for (const change of payload.seg) {
      const at = segs.findIndex((s) => s.id === change.id);
      const merged = { ...segs[at], ...keep(change) } as WledSegment;
      if (at === -1) segs.push(merged);
      else segs[at] = merged;
    }
    next.seg = segs;
  }
  return next;
}

type Send = (payload: object) => Promise<void>;

export class InOrder {
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
export class LatestOnly {
  private next: object | null = null;
  private running: Promise<void> | null = null;

  constructor(private readonly send: Send) {}

  push(payload: object) {
    this.next = payload;
    this.running ??= this.drain().finally(() => {
      this.running = null;
    });
  }

  async idle() {
    await this.running;
  }

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

// Writes go as text/plain, which skips the CORS preflight. targetAddressSpace
// lets Chrome reach the strip from an https page.
export class WledClient {
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

  /** The saved presets, by id */
  async readPresets(): Promise<unknown> {
    const res = await fetch(`${this.host}/presets.json`, {
      signal: AbortSignal.timeout(2500),
      targetAddressSpace: "local",
    } as RequestInit);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

/** A pretend strip in localStorage for ?wled=mock, shared between tabs. Each
 * part has its own key, so tabs don't write each other's stale copies back. */
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
            col: [look.col ?? OFFICE_WHITE],
          },
        ],
      },
      info: { leds: { count: 900 } },
    });
  }

  // The look saved with the office preset, as the real strip would keep it
  override readPresets(): Promise<unknown> {
    try {
      const saved = JSON.parse(
        localStorage.getItem(MockWledClient.PRESET_KEY) ?? "null",
      ) as (string | null)[] | null;
      const look = JSON.parse(saved?.[3] ?? "{}") as {
        fx?: number;
        col?: number[];
      };
      return Promise.resolve({
        250: {
          seg: [{ id: 0, fx: look.fx ?? 0, col: [look.col ?? OFFICE_WHITE] }],
        },
      });
    } catch {
      return Promise.resolve({});
    }
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
