import { useCallback, useRef } from "react";
import type { Pomodoro } from "app/hooks/use-pomodoro.hook";
import { usePresenceLights } from "app/hooks/use-presence-lights.hook";
import type { Strip } from "app/hooks/use-strip.hook";
import { LightPreset, presetOf, presetPayload } from "app/utils/light-presets";
import { animate, easeOutCubic } from "app/utils/strip-animation";
import { lookOf } from "app/utils/wled-client";
import {
  DEFAULT_NOTE,
  LightSettings,
  encodeNote,
  isPomoState,
  noteOf,
} from "app/utils/wled-names";
import {
  OFFICE_WHITE,
  Rgb,
  growPayload,
  tagPayload,
} from "app/utils/wled-payloads";

const GROW_MS = 700;
const GROW_STEPS = 14;

/** The room's light switch, read from and written to the strip */
export function useRoomLights(strip: Strip, pomo: Pomodoro) {
  const { frames, lastWriteRef, read, write, showLocally } = strip;
  const { isRunningNow, stopSession } = pomo;

  const isOn = strip.state?.on !== false;
  const bri = strip.state?.bri ?? 128;
  const look = lookOf(strip.state);
  const preset = presetOf(look);
  const lightColor = (preset?.shown ??
    look?.col?.slice(0, 3) ??
    OFFICE_WHITE) as Rgb;

  // During a pomodoro the name holds the session, so keep the last note
  const noteRef = useRef(DEFAULT_NOTE);
  if (strip.state && !isPomoState(strip.state))
    noteRef.current = noteOf(strip.state);
  const note = noteRef.current;

  const isOnRef = useRef(isOn);
  isOnRef.current = isOn;
  const lightColorRef = useRef(lightColor);
  lightColorRef.current = lightColor;
  const ledCountRef = useRef(strip.ledCount);
  ledCountRef.current = strip.ledCount;

  const growRef = useRef(0);
  const setLights = useCallback(
    async (on: boolean) => {
      if (on) return write({ on });
      // A running session keeps its segments: moving segment 0 back would
      // drop its name, and with it the session
      if (isRunningNow()) return write({ on: false });
      // Stop a turn-on animation, or its frames turn the strip back on
      growRef.current += 1;
      await frames.settle();
      await write({
        on: false,
        seg: [
          { id: 0, start: 0, stop: ledCountRef.current, frz: false },
          { id: 1, stop: 0 },
        ],
      });
    },
    [frames, isRunningNow, write],
  );

  // From off, the strip lights up from its centre outwards
  const turnOn = useCallback(async () => {
    if (isOnRef.current || isRunningNow()) return write({ on: true });
    showLocally({ on: true });
    const id = ++growRef.current;
    const done = await animate(
      frames,
      GROW_STEPS,
      GROW_MS,
      (_, k) => {
        lastWriteRef.current = Date.now();
        const lit = easeOutCubic((k + 1) / GROW_STEPS) * ledCountRef.current;
        return growPayload(
          ledCountRef.current,
          Math.round(lit),
          lightColorRef.current,
        );
      },
      () => growRef.current !== id || isRunningNow(),
    );
    await frames.idle();
    if (done)
      await write({
        seg: [
          { id: 0, start: 0, stop: ledCountRef.current, frz: false },
          { id: 1, stop: 0 },
        ],
      });
  }, [frames, isRunningNow, lastWriteRef, showLocally, write]);

  // A session ends first, or its frames would turn the strip back on
  const switchOff = useCallback(async () => {
    if (isRunningNow()) await stopSession();
    await setLights(false);
  }, [isRunningNow, setLights, stopSession]);
  // Every browser notices an arrival; the first one turns the lights on
  const switchOn = useCallback(async () => {
    const data = await read();
    if (data?.state?.on !== false) return;
    isOnRef.current = false;
    await turnOn();
  }, [read, turnOn]);
  const present = usePresenceLights(switchOff, switchOn);

  // Only presence changes switch the strip, so this choice sticks
  const toggle = useCallback(
    () => void (isOn ? setLights(false) : turnOn()),
    [isOn, setLights, turnOn],
  );

  const setBrightness = useCallback(
    (value: number) => {
      const payload = { on: true, bri: value, transition: 0 };
      showLocally(payload);
      frames.push(payload);
    },
    [frames, showLocally],
  );

  const applyPreset = useCallback(
    (p: LightPreset) => {
      const payload = presetPayload(p);
      void write({
        ...payload,
        seg: [
          { ...payload.seg[0], start: 0, stop: ledCountRef.current },
          { id: 1, stop: 0 },
        ],
      });
    },
    [write],
  );

  const setEffect = useCallback(
    (key: keyof LightSettings, on: boolean) => {
      const next = {
        ...note,
        settings: { ...note.settings, [key]: on },
        playing: false,
      };
      void write(tagPayload(encodeNote(next)));
    },
    [note, write],
  );

  const lightColorNow = useCallback(() => lightColorRef.current, []);

  return {
    status: {
      isOn,
      bri,
      preset,
      lightColor,
      effects: note.settings,
      officeEmpty: present === false,
    },
    toggle,
    setBrightness,
    applyPreset,
    setEffect,
    lightColorNow,
  };
}

export type RoomLights = ReturnType<typeof useRoomLights>;
