// The few things that would quietly break the shared strip if they changed

import { describe, expect, it } from "vitest";
import { SessionConfig, sessionAt, startSession } from "app/utils/pomo-session";
import {
  DEFAULT_NOTE,
  encodeNote,
  encodeTag,
  noteOf,
  painterOf,
  sessionOnStrip,
} from "app/utils/wled-names";
import { BLUE, GREEN, Rgb, frameFor } from "app/utils/wled-payloads";

const T0 = 1_700_000_000_000; // a whole second, as stored on the strip
const config = {
  workMs: 100_000,
  breakMs: 50_000,
  longBreakMs: 80_000,
  longBreakEvery: 2,
  workMode: "bar" as const,
  breakMode: "solid" as const,
};
const named = (n: string) => ({ seg: [{ id: 0, n }] });

describe("the strip", () => {
  it("keeps a session and its painter in the name, within 64 characters", () => {
    const session = startSession(config, T0);
    const tag = encodeTag(session, { id: "ab12", until: T0 + 12_000 });
    expect(tag.length).toBeLessThanOrEqual(64);
    expect(sessionOnStrip(named(tag))).toEqual(session);
    expect(painterOf(named(tag))).toEqual({ id: "ab12", until: T0 + 12_000 });
  });

  it("keeps the light note, even with the longest event", () => {
    const note = {
      ...DEFAULT_NOTE,
      settings: { ...DEFAULT_NOTE.settings, merges: false },
      dayLook: 4,
      event: `b:${"x".repeat(39)}:12-31`,
    };
    expect(encodeNote(note).length).toBeLessThanOrEqual(64);
    expect(noteOf(named(encodeNote(note)))).toEqual(note);
    expect(noteOf(named("Stue"))).toEqual(DEFAULT_NOTE);
  });

  it("rolls through work, break and the long break on its own", () => {
    const s = startSession(config, T0);
    const at = (ms: number) => sessionAt(s, T0 + ms).session;
    expect(at(100_000)).toMatchObject({ phase: "break", cycle: 1 });
    expect(at(150_000)).toMatchObject({ phase: "work", cycle: 2 });
    expect(at(250_000)).toMatchObject({ phase: "long-break", cycle: 2 });
  });

  it("fills from the left in every phase, the break in green", () => {
    // LEDs of a colour, and where the first of them is
    const ledsOf = (cfg: SessionConfig, ms: number, col: Rgb) => {
      const s = startSession(cfg, T0);
      const i = frameFor(s, T0 + ms, 900).seg[0].i;
      let count = 0;
      let from = Infinity;
      for (let k = 0; k < i.length; k += 3)
        if (i[k + 2] === col) {
          count += (i[k + 1] as number) - (i[k] as number);
          from = Math.min(from, i[k] as number);
        }
      return { count, from };
    };
    expect(ledsOf(config, 0, BLUE).count).toBe(0);
    expect(ledsOf(config, 50_000, BLUE)).toEqual({ count: 450, from: 0 });
    // Halfway through the break, green has filled half, over the blue
    const barBreak = { ...config, breakMode: "bar" as const };
    expect(ledsOf(barBreak, 125_000, GREEN)).toEqual({ count: 450, from: 0 });
    expect(ledsOf(barBreak, 125_000, BLUE)).toEqual({ count: 450, from: 450 });
    // "slutt" during the break: still all blue until the break is over
    expect(ledsOf(config, 125_000, BLUE).count).toBe(900);
  });
});
