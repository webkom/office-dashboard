import { useEffect, useRef } from "react";

const REPOS = ["lego", "lego-webapp"];
const POLL_MS = 60_000;
// GitHub answers "not changed" without counting it against the rate limit,
// so checking every minute is free until something changes
const LIMITED_POLL_MS = 10 * 60_000;
// Only fresh merges: not the ones from before the page was opened
const FRESH_MS = 15 * 60_000;

type Pull = { number: number; merged_at: string | null };

/** Calls `onMerged` with "<repo>#<number>" for each newly merged pull request */
export function useMergedPrs(
  enabled: boolean,
  onMerged: (key: string) => void,
) {
  const onMergedRef = useRef(onMerged);
  onMergedRef.current = onMerged;

  useEffect(() => {
    if (!enabled) return;
    const seen = new Map<string, Set<number>>();
    let timer = 0;
    let stopped = false;

    const check = async () => {
      let delay = POLL_MS;
      for (const repo of REPOS) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/webkom/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=10`,
            { cache: "no-cache" },
          );
          if (res.status === 403 || res.status === 429) {
            delay = LIMITED_POLL_MS;
            continue;
          }
          if (!res.ok) continue;
          const merged = ((await res.json()) as Pull[]).filter(
            (p) => p.merged_at,
          );
          const known = seen.get(repo);
          seen.set(repo, new Set(merged.map((p) => p.number)));
          if (!known) continue; // first look: just learn what is there
          const fresh = merged.find(
            (p) =>
              !known.has(p.number) &&
              Date.now() - Date.parse(p.merged_at!) < FRESH_MS,
          );
          if (fresh) onMergedRef.current(`${repo}#${fresh.number}`);
        } catch {
          // Offline; try again next time
        }
      }
      if (!stopped) timer = window.setTimeout(check, delay);
    };

    void check();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);
}
