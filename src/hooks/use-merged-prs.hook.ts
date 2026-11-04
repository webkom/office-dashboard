import { useEffect, useRef } from "react";
import { DASHBOARD_API } from "app/config";

const REPOS = ["lego", "lego-webapp"];
// GitHub tells the backend about merges through a webhook; asking it is cheap
const POLL_MS = 15_000;
// Only fresh merges: not the ones from before the page was opened
const FRESH_MS = 15 * 60_000;

type Merge = { repo: string; number: number; merged_at: string };

/** Calls `onMerged` with "<repo>#<number>" for each newly merged pull request */
export function useMergedPrs(
  enabled: boolean,
  onMerged: (key: string) => void,
) {
  const onMergedRef = useRef(onMerged);
  onMergedRef.current = onMerged;

  useEffect(() => {
    if (!enabled) return;
    let seen: Set<string> | null = null;
    let timer = 0;
    let stopped = false;

    const check = async () => {
      try {
        const res = await fetch(`${DASHBOARD_API}/merges`);
        if (res.ok) {
          const merges = ((await res.json()) as Merge[]).filter((m) =>
            REPOS.includes(m.repo),
          );
          const keys = merges.map((m) => `${m.repo}#${m.number}`);
          const fresh = seen
            ? merges.find(
                (m, i) =>
                  !seen!.has(keys[i]) &&
                  Date.now() - Date.parse(m.merged_at) < FRESH_MS,
              )
            : undefined; // first look: just learn what is there
          seen = new Set(keys);
          if (fresh) onMergedRef.current(`${fresh.repo}#${fresh.number}`);
        }
      } catch {
        // Offline; try again next time
      }
      if (!stopped) timer = window.setTimeout(check, POLL_MS);
    };

    void check();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);
}
