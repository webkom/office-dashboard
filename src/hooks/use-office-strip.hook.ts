import { useLightEvents } from "app/hooks/use-light-events.hook";
import { usePomodoro } from "app/hooks/use-pomodoro.hook";
import { useRoomLights } from "app/hooks/use-room-lights.hook";
import { useStrip } from "app/hooks/use-strip.hook";

export function useOfficeStrip() {
  const strip = useStrip();
  const pomo = usePomodoro(strip);
  const lights = useRoomLights(strip, pomo);
  useLightEvents(strip, pomo, lights);
  return { pomo, lights };
}
