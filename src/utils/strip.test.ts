// The few things that would quietly break the shared strip if they changed

import { describe, expect, it } from "vitest";
import {
  DISPLAY_MODES,
  SessionConfig,
  decodeSession,
  encodeSession,
  sessionAt,
  startSession,
} from "app/utils/pomo-session";
import {
  DEFAULT_NOTE,
  encodeNote,
  encodeTag,
  noteOf,
  painterOf,
  sessionOnStrip,
} from "app/utils/wled-names";
import {
  BLUE,
  GREEN,
  RED,
  Rgb,
  frameFor,
  officeLookOf,
  tagPayload,
  themeFrameFor,
  withTag,
} from "app/utils/wled-payloads";

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

  it("lets green eat red in work and blue in a break, from the left", () => {
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
    expect(ledsOf(config, 0, RED).count).toBe(900);
    expect(ledsOf(config, 50_000, GREEN)).toEqual({ count: 450, from: 0 });
    expect(ledsOf(config, 50_000, RED)).toEqual({ count: 450, from: 450 });
    // Halfway through the break, green has eaten half the blue
    const barBreak = { ...config, breakMode: "bar" as const };
    expect(ledsOf(barBreak, 125_000, GREEN)).toEqual({ count: 450, from: 0 });
    expect(ledsOf(barBreak, 125_000, BLUE)).toEqual({ count: 450, from: 450 });
    // "slutt" during the break: still all blue until the break is over
    expect(ledsOf(config, 125_000, BLUE).count).toBe(900);
  });
});

describe("the office look during a pomodoro", () => {
  it("keeps every pair of modes in the name, and old letters for old pairs", () => {
    for (const workMode of DISPLAY_MODES)
      for (const breakMode of DISPLAY_MODES) {
        const s = startSession({ ...config, workMode, breakMode }, T0);
        expect(decodeSession(encodeSession(s))).toEqual(s);
      }
    const old = startSession({ ...config, breakMode: "bar" }, T0);
    expect(encodeSession(old).split(":")[5][0]).toBe("b");
  });

  it("twinkles while green eats, in the saved look's motion", () => {
    const look = officeLookOf({
      250: { seg: [{ id: 0, fx: 80, sx: 90, ix: 170, pal: 31, col: [RED] }] },
    });
    const s = startSession({ ...config, workMode: "theme" }, T0);
    const [rest, eaten] = themeFrameFor(s, T0 + 50_000, 900, look).seg;
    expect(rest).toMatchObject({
      id: 0,
      start: 450,
      stop: 900,
      rev: true,
      fx: 80,
      sx: 90,
    });
    expect(rest).toMatchObject({ pal: 2, col: [RED, RED, [0, 0, 0]] });
    expect(eaten).toMatchObject({
      id: 1,
      start: 0,
      stop: 450,
      rev: false,
      fx: 80,
    });
    expect(eaten).toMatchObject({ col: [GREEN, GREEN, [0, 0, 0]] });
    // Nothing eaten yet: no second segment
    expect(themeFrameFor(s, T0, 900, look).seg[1]).toEqual({ id: 1, stop: 0 });
    // The fill modes remove it again
    expect(frameFor(s, T0, 900).seg[1]).toEqual({ id: 1, stop: 0 });
    // A solid look, or none saved, twinkles anyway
    expect(themeFrameFor(s, T0, 900, { fx: 0 }).seg[0].fx).toBe(80);
    expect(officeLookOf(null).fx).toBe(80);
  });

  it("attaches the session tag to segment 0 of painted frames", () => {
    const look = officeLookOf(null);
    const s = startSession({ ...config, workMode: "theme" }, T0);
    const tag = encodeTag(s, { id: "ab12", until: T0 + 12_000 });
    const frame = withTag(themeFrameFor(s, T0 + 50_000, 900, look), tag);
    expect(frame.seg[0]).toMatchObject({ id: 0, start: 450, n: tag });
    expect(frame.seg[1]).not.toHaveProperty("n");
    expect(sessionOnStrip(frame)).toEqual(s);
  });

  it("writes tags with transition 0 to prevent crossfade flicker", () => {
    expect(tagPayload("test-tag")).toEqual({
      transition: 0,
      seg: [{ id: 0, n: "test-tag" }],
    });
  });
});
