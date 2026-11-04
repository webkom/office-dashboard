import { useEffect, useRef } from "react";
import { socketUrl } from "app/utils/api";

const REPOS = ["lego", "lego-webapp"];
const RECONNECT_MS = [1000, 5000, 15_000, 60_000];

type Message = { type: string; repo: string; number: number };

/**
 * Calls `onMerged` with "<repo>#<number>" when a pull request is merged.
 * GitHub tells the backend through a webhook, and the backend pushes it here.
 */
export function useMergedPrs(
  enabled: boolean,
  onMerged: (key: string) => void,
) {
  const onMergedRef = useRef(onMerged);
  onMergedRef.current = onMerged;

  useEffect(() => {
    if (!enabled) return;
    let ws: WebSocket | null = null;
    let timer = 0;
    let attempts = 0;
    let stopped = false;

    const connect = () => {
      ws = new WebSocket(socketUrl("/ws"));
      ws.onopen = () => {
        attempts = 0;
      };
      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const m = JSON.parse(e.data) as Message;
          if (m.type === "merge" && REPOS.includes(m.repo))
            onMergedRef.current(`${m.repo}#${m.number}`);
        } catch {
          // Not for us
        }
      };
      ws.onclose = () => {
        if (stopped) return;
        const delay =
          RECONNECT_MS[Math.min(attempts++, RECONNECT_MS.length - 1)];
        timer = window.setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      ws?.close();
    };
  }, [enabled]);
}
