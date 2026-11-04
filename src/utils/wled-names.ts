// Segment 0's name holds a running pomodoro, or else the office's light note

import {
  POMO_PREFIX,
  Session,
  decodeSession,
  encodeSession,
} from "app/utils/pomo-session";
import { WledState, firstSegment } from "app/utils/wled-client";

const nameOf = (state?: WledState | null) => firstSegment(state)?.n ?? "";

export const isPomoState = (state?: WledState | null) =>
  Boolean(state?.seg?.some((s) => s.n?.startsWith(POMO_PREFIX)));

// "<session>|<painter>.<until>": the one browser that paints the strip, and
// until when (seconds, base 36)
export type Painter = { id: string; until: number };

export const sessionOnStrip = (state?: WledState | null): Session | null =>
  decodeSession(nameOf(state).split("|")[0]);

export function painterOf(state?: WledState | null): Painter | null {
  const m = /\|([a-z0-9]+)\.([a-z0-9]+)$/.exec(nameOf(state));
  return m ? { id: m[1], until: parseInt(m[2], 36) * 1000 } : null;
}

export const encodeTag = (s: Session, painter: Painter) =>
  `${encodeSession(s)}|${painter.id}.${Math.floor(painter.until / 1000).toString(36)}`;

// Our frames freeze segment 0. Frozen but untagged means a frame landed after
// someone else gave the lights back.
export const isLeftoverFrame = (state?: WledState | null) =>
  !isPomoState(state) && Boolean(firstSegment(state)?.frz);

// The note: effect settings, the morning's look and the last event shown, e.g.
// "Lys:bpk@1:p:lego#12". "Lys!" while an event plays.
export type LightSettings = {
  birthday: boolean;
  merges: boolean;
  evening: boolean;
};
export type Note = {
  settings: LightSettings;
  /** The look from before the evening, until the morning */
  dayLook: number | null;
  event: string | null;
  playing: boolean;
};

const SETTING_CODE: Record<keyof LightSettings, string> = {
  birthday: "b",
  merges: "p",
  evening: "k",
};
export const DEFAULT_NOTE: Note = {
  settings: { birthday: true, merges: true, evening: true },
  dayLook: null,
  event: null,
  playing: false,
};

export function noteOf(state?: WledState | null): Note {
  const m = /^Lys([:!])([a-z]*)(?:@(\d+))?(?::(.+))?$/.exec(nameOf(state));
  if (!m) return DEFAULT_NOTE;
  const [, mark, flags, day, event] = m;
  const settings = Object.fromEntries(
    Object.entries(SETTING_CODE).map(([k, c]) => [k, flags.includes(c)]),
  ) as LightSettings;
  return {
    settings,
    dayLook: day === undefined ? null : Number(day),
    event: event ?? null,
    playing: mark === "!",
  };
}

export function encodeNote(note: Note): string {
  const flags = Object.entries(SETTING_CODE)
    .filter(([k]) => note.settings[k as keyof LightSettings])
    .map(([, c]) => c)
    .join("");
  const day = note.dayLook === null ? "" : `@${note.dayLook}`;
  const event = note.event ? `:${note.event}` : "";
  return `Lys${note.playing ? "!" : ":"}${flags}${day}${event}`.slice(0, 64);
}
