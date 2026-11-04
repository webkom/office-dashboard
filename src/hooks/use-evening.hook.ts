import { useEffect, useRef } from "react";

const EVENING_HOUR = 20;
const MORNING_HOUR = 6;

type Part = "day" | "evening";
const partOf = (d: Date): Part =>
  d.getHours() >= EVENING_HOUR || d.getHours() < MORNING_HOUR
    ? "evening"
    : "day";

/**
 * Calls `onChange("evening")` at 20:00 and `onChange("day")` at 06:00, for
 * changes that happen while the page is open. `onChange` returns false to be
 * asked again a little later, e.g. while a pomodoro runs.
 */
export function useEvening(onChange: (part: Part) => Promise<boolean>) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let last = partOf(new Date());
    let pending: Part | null = null;
    let busy = false;
    const tick = async () => {
      const now = partOf(new Date());
      if (now !== last) pending = now;
      last = now;
      if (!pending || busy) return;
      busy = true;
      const part = pending;
      try {
        if (await onChangeRef.current(part)) pending = null;
      } finally {
        busy = false;
      }
    };
    const t = window.setInterval(() => void tick(), 30_000);
    return () => window.clearInterval(t);
  }, []);
}
