import { useCallback } from "react";
import { useBirthdayArrivals } from "app/hooks/use-birthday-arrivals.hook";
import { useEvening } from "app/hooks/use-evening.hook";
import { useMergedPrs } from "app/hooks/use-merged-prs.hook";
import type { Pomodoro } from "app/hooks/use-pomodoro.hook";
import type { RoomLights } from "app/hooks/use-room-lights.hook";
import type { Strip } from "app/hooks/use-strip.hook";
import {
  LIGHT_PRESETS,
  LightPreset,
  presetOf,
  presetOfId,
  presetPayload,
} from "app/utils/light-presets";
import { steadySleep } from "app/utils/steady-timer";
import { animate, easeInOutSine } from "app/utils/strip-animation";
import { WledState, lookOf } from "app/utils/wled-client";
import {
  LightSettings,
  encodeNote,
  noteOf,
  sessionOnStrip,
} from "app/utils/wled-names";
import {
  Rgb,
  bandPayload,
  fireworksPayload,
  restoreFrom,
  tagPayload,
} from "app/utils/wled-payloads";

const CELEBRATION_MS = 3000;
const SWEEP_MS = 1400;
const SWEEP_STEPS = 25;
const GREEN: Rgb = [30, 230, 90];
const DAY_FADE = 600; // a minute, in WLED's 100 ms steps

/** Light effects for a birthday, a merged pull request and the evening.
 * Never during a pomodoro, and only those the office has left on. */
export function useLightEvents(
  strip: Strip,
  pomo: Pomodoro,
  lights: RoomLights,
) {
  const { frames, lastWriteRef, read, write } = strip;
  const { isRunningNow } = pomo;
  const { lightColorNow } = lights;

  // Plays once however many browsers notice it: the note on the strip says
  // it has been shown
  const playEvent = useCallback(
    async (
      event: string,
      setting: keyof LightSettings,
      show: () => Promise<void>,
      finish: (note: string, before: WledState | undefined) => WledState,
      intoDark = false,
    ) => {
      if (isRunningNow()) return;
      const data = await read();
      if (!data || sessionOnStrip(data.state)) return;
      const current = noteOf(data.state);
      if (!current.settings[setting] || current.event === event) return;
      if (!intoDark && data.state?.on === false) return;
      await write(tagPayload(encodeNote({ ...current, event, playing: true })));
      await show();
      await frames.idle();
      // Unless a pomodoro has started meanwhile
      const after = noteOf((await read())?.state);
      if (after.playing && after.event === event)
        await write(
          finish(encodeNote({ ...current, event, playing: false }), data.state),
        );
    },
    [frames, isRunningNow, read, write],
  );

  useBirthdayArrivals(
    (key) =>
      void playEvent(
        `b:${key}`,
        "birthday",
        async () => {
          await write(fireworksPayload);
          await steadySleep(CELEBRATION_MS);
        },
        (note, before) => restoreFrom(before, note),
        true,
      ),
  );

  const sweep = useCallback(async () => {
    const ledCount = strip.ledCount;
    const width = Math.round(ledCount * 0.12);
    await animate(frames, SWEEP_STEPS, SWEEP_MS, (t) => {
      lastWriteRef.current = Date.now();
      const at = -width / 2 + (ledCount + width) * easeInOutSine(t);
      return bandPayload(ledCount, lightColorNow(), GREEN, at, width);
    });
  }, [frames, lastWriteRef, lightColorNow, strip.ledCount]);
  useMergedPrs(
    strip.isReachable && lights.status.effects.merges,
    (key) =>
      void playEvent(`p:${key}`, "merges", sweep, (n) => ({
        seg: [{ id: 0, frz: false, n }],
      })),
  );

  // Kveld at 20:00, the day look back at 06:00; the day look waits in the note
  useEvening(async (part) => {
    if (isRunningNow()) return false;
    const data = await read();
    if (!data || sessionOnStrip(data.state)) return false;
    const note = noteOf(data.state);
    if (!note.settings.evening) return true;
    const kveld = presetOfId("evening");
    const isKveld = lookOf(data.state)?.fx === kveld.fx;

    const fadeTo = (p: LightPreset, dayLook: number | null) => {
      const payload = presetPayload(p, DAY_FADE);
      const named = {
        ...payload,
        seg: [{ ...payload.seg[0], n: encodeNote({ ...note, dayLook }) }],
      };
      // Setting bri would turn the strip on
      return data.state?.on === false
        ? { ...named, on: undefined, bri: undefined }
        : named;
    };

    if (part === "evening") {
      if (isKveld) return true;
      const day = presetOf(lookOf(data.state));
      await write(fadeTo(kveld, day ? LIGHT_PRESETS.indexOf(day) : null));
    } else if (isKveld) {
      // Unless someone has picked another look since
      const day = LIGHT_PRESETS[note.dayLook ?? -1] ?? presetOfId("white");
      await write(fadeTo(day, null));
    }
    return true;
  });
}
