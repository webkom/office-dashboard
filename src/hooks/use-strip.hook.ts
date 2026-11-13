import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WLED_URLS } from "app/config";
import { clearSteadyTimeout, steadyTimeout } from "app/utils/steady-timer";
import {
  FrameQueue,
  MockWledClient,
  WledClient,
  WledJson,
  WledState,
  applyWrite,
} from "app/utils/wled-client";
import { isPomoState } from "app/utils/wled-names";

const POLL_MS = 10_000;

// mDNS (".local") is flaky on some machines, so the strip's IP is remembered
const HOST_KEY = "wled-pomo-host";

function firstSuccess<T>(tasks: Promise<T>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let left = tasks.length;
    if (left === 0) resolve(null);
    for (const task of tasks) {
      task.then(resolve, () => {
        left -= 1;
        if (left === 0) resolve(null);
      });
    }
  });
}

async function findStrip() {
  let remembered: string | null = null;
  try {
    remembered = localStorage.getItem(HOST_KEY);
  } catch {
    // Ignore
  }
  const hosts = Array.from(
    new Set([remembered, ...WLED_URLS].filter(Boolean)),
  ) as string[];
  return firstSuccess(
    hosts.map(async (host) => {
      const data = await new WledClient(host).read();
      const ipHost = data.info?.ip ? `http://${data.info.ip}` : host;
      try {
        localStorage.setItem(HOST_KEY, ipHost);
      } catch {
        // Ignore
      }
      return { host: ipHost, data };
    }),
  );
}

type OnRead = (state: WledState | undefined) => Promise<void> | void;

/** The strip, the only source of truth. Keeps a copy of its state from
 * regular reads, with our own writes shown on it straight away. */
export function useStrip() {
  const isMock =
    new URLSearchParams(window.location.search).get("wled") === "mock";

  const clientRef = useRef<WledClient>(
    isMock ? new MockWledClient() : new WledClient(WLED_URLS[0]),
  );
  const client = clientRef.current;
  const [isReachable, setIsReachable] = useState(isMock);
  const [ledCount, setLedCount] = useState(900);
  const [state, setState] = useState<WledState>();
  const stateRef = useRef(state);
  stateRef.current = state;

  const lastWriteRef = useRef(0);
  const lastReadRef = useRef(0);
  const missedReadsRef = useRef(0);
  const listenersRef = useRef(new Set<OnRead>());
  const pollDelayRef = useRef<() => number>(() => POLL_MS);

  const read = useCallback(async (): Promise<WledJson | null> => {
    try {
      return await client.read();
    } catch {
      if (isMock) return null;
    }
    const found = await findStrip();
    if (found) client.host = found.host;
    return found?.data ?? null;
  }, [client, isMock]);

  const readPresets = useCallback(
    () => client.readPresets().catch(() => null),
    [client],
  );

  const write = useCallback(
    async (payload: WledState): Promise<boolean> => {
      lastWriteRef.current = Date.now();
      setState((s) => applyWrite(s, payload));
      const ok = await client.state.push(payload);
      lastWriteRef.current = Date.now();
      return ok;
    },
    [client],
  );

  // For writes sent outside `state` (brightness drags and animation frames)
  const showLocally = useCallback((payload: WledState) => {
    lastWriteRef.current = Date.now();
    setState((s) => applyWrite(s, payload));
  }, []);

  const markWrite = useCallback(() => {
    lastWriteRef.current = Date.now();
  }, []);

  const frames = useMemo<FrameQueue>(
    () => ({
      push: (payload: object) => {
        lastWriteRef.current = Date.now();
        client.frames.push(payload);
      },
      idle: () => client.frames.idle(),
      settle: () => client.frames.settle(),
    }),
    [client],
  );

  const pushBri = useCallback(
    (payload: object) => {
      lastWriteRef.current = Date.now();
      client.bri.push(payload);
    },
    [client],
  );

  const sync = useCallback(async () => {
    const askedAt = Date.now();
    const data = await read();
    if (!data) {
      // One miss is often a slow mDNS lookup; a pomodoro keeps its controls
      missedReadsRef.current += 1;
      if (missedReadsRef.current >= 2 && !isPomoState(stateRef.current))
        setIsReachable(false);
      return;
    }
    missedReadsRef.current = 0;
    setIsReachable(true);
    if (data.info?.leds?.count) setLedCount(data.info.leds.count);

    // Skip reads that are older than one already used, or than our own writes
    if (askedAt < lastReadRef.current) return;
    if (askedAt < lastWriteRef.current || client.busy) return;
    lastReadRef.current = askedAt;

    setState(data.state);
    for (const listener of listenersRef.current) await listener(data.state);
  }, [client, read]);

  const rescheduleRef = useRef<() => void>(() => {});

  useEffect(() => {
    let timer = 0;
    let stopped = false;
    let polling = false;
    const schedule = () => {
      clearSteadyTimeout(timer);
      if (!stopped) timer = steadyTimeout(loop, pollDelayRef.current());
    };
    const loop = async () => {
      polling = true;
      try {
        await sync();
      } finally {
        polling = false;
      }
      schedule();
    };
    rescheduleRef.current = () => {
      if (!polling) schedule();
    };
    void loop();
    const onWake = () => void sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === MockWledClient.KEY) void sync();
    };
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    window.addEventListener("storage", onStorage);
    return () => {
      stopped = true;
      rescheduleRef.current = () => {};
      clearSteadyTimeout(timer);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
      window.removeEventListener("storage", onStorage);
      void client.frames.settle();
    };
  }, [client, sync]);

  const onRead = useCallback((listener: OnRead) => {
    listenersRef.current.add(listener);
    return () => void listenersRef.current.delete(listener);
  }, []);

  const setPollDelay = useCallback((delay: () => number) => {
    pollDelayRef.current = delay;
  }, []);

  const pokePoll = useCallback(() => {
    rescheduleRef.current();
  }, []);

  return {
    isMock,
    isReachable,
    ledCount,
    state,
    frames,
    pushBri,
    lastWriteRef,
    markWrite,
    read,
    readPresets,
    write,
    showLocally,
    onRead,
    setPollDelay,
    pokePoll,
  };
}

export type Strip = ReturnType<typeof useStrip>;
