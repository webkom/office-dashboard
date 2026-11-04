import { useEffect, useRef } from "react";
import { useDashboardData, usePresence } from "app/hooks/dashboard-data.hook";
import filterBirthdayMembers from "app/utils/birthday-utils";

/** Calls `onArrive` with "<github>:<month>-<day>" when a member with a birthday today
 * checks in at the office */
export function useBirthdayArrivals(onArrive: (key: string) => void) {
  const members = useDashboardData().data?.members;
  const { data: presence } = usePresence();
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;
  const lastRef = useRef<Map<string, boolean> | null>(null);

  useEffect(() => {
    if (!presence?.length) return;
    const active = new Map(
      presence.map((t) => [t.github_name.toLowerCase(), Boolean(t.is_active)]),
    );
    const last = lastRef.current;
    lastRef.current = active;
    if (!last) return; // only arrivals seen while the page is open

    const now = new Date();
    const today = `${now.getMonth() + 1}-${now.getDate()}`;
    for (const member of filterBirthdayMembers(members ?? [])) {
      const handle = member.github.toLowerCase();
      if (active.get(handle) && last.get(handle) === false)
        onArriveRef.current(`${handle}:${today}`);
    }
  }, [presence, members]);
}
