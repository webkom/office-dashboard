import { useEffect, useRef } from "react";
import { OfficeTimes, usePresence } from "app/hooks/dashboard-data.hook";

const LEAVE_GRACE_MS = 5 * 60 * 1000;

export const anyonePresent = (officeTimes?: OfficeTimes[]) =>
  officeTimes?.length ? officeTimes.some((t) => t.is_active) : null;

export function usePresenceLights(
  onEmpty: () => Promise<void>,
  onArrive: () => Promise<void>,
) {
  const { data } = usePresence();
  const present = anyonePresent(data);

  const handlers = useRef({ onEmpty, onArrive });
  handlers.current = { onEmpty, onArrive };
  const lastRef = useRef<boolean | null>(null);
  // Empty for longer than the grace, or empty when the page opened. Only then
  // does an arrival turn the lights on, so a phone dropping off the wifi for a
  // moment doesn't undo lights someone switched off by hand.
  const awayRef = useRef(false);

  useEffect(() => {
    if (present === null) return;
    const was = lastRef.current;
    lastRef.current = present;
    if (was === null) {
      awayRef.current = !present;
      return;
    }
    if (was === present) return;
    if (present) {
      if (awayRef.current) void handlers.current.onArrive();
      awayRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      awayRef.current = true;
      void handlers.current.onEmpty();
    }, LEAVE_GRACE_MS);
    return () => window.clearTimeout(t);
  }, [present]);

  return present;
}
