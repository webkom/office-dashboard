import { useEffect, useRef } from "react";
import { OfficeTimes, useDashboardData } from "app/hooks/dashboard-data.hook";

const LEAVE_GRACE_MS = 5 * 60 * 1000;

export const anyonePresent = (officeTimes?: OfficeTimes[]) =>
  officeTimes?.length ? officeTimes.some((t) => t.is_active) : null;

export function usePresenceLights(
  onEmpty: () => Promise<void>,
  onArrive: () => Promise<void>,
) {
  const { data } = useDashboardData();
  const present = anyonePresent(data?.office_times);

  const handlers = useRef({ onEmpty, onArrive });
  handlers.current = { onEmpty, onArrive };
  const lastRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (present === null) return;
    const was = lastRef.current;
    lastRef.current = present;
    if (was === null || was === present) return;
    if (present) {
      void handlers.current.onArrive();
      return;
    }
    const t = window.setTimeout(
      () => void handlers.current.onEmpty(),
      LEAVE_GRACE_MS,
    );
    return () => window.clearTimeout(t);
  }, [present]);

  return present;
}
