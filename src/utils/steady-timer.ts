// Chrome slows timers in hidden pages, including a window covered by other
// windows, down to about once a minute. Timers in a worker keep time, so the
// strip's timing runs on these.

const WORKER_SOURCE = `
const timers = new Map();
onmessage = ({ data: [id, ms] }) => {
  if (ms < 0) {
    clearTimeout(timers.get(id));
    timers.delete(id);
    return;
  }
  timers.set(id, setTimeout(() => {
    timers.delete(id);
    postMessage(id);
  }, ms));
};
`;

let worker: Worker | null | undefined;
const callbacks = new Map<number, () => void>();
let nextId = 1;

function getWorker() {
  if (worker !== undefined) return worker;
  try {
    const url = URL.createObjectURL(
      new Blob([WORKER_SOURCE], { type: "text/javascript" }),
    );
    worker = new Worker(url);
    worker.onmessage = (e: MessageEvent<number>) => {
      const callback = callbacks.get(e.data);
      callbacks.delete(e.data);
      callback?.();
    };
  } catch {
    worker = null; // falls back to page timers
  }
  return worker;
}

/** Like setTimeout, but on time in a hidden page too */
export function steadyTimeout(callback: () => void, ms: number): number {
  const w = getWorker();
  if (!w) return -window.setTimeout(callback, ms);
  const id = nextId++;
  callbacks.set(id, callback);
  w.postMessage([id, ms]);
  return id;
}

export function clearSteadyTimeout(id: number) {
  if (id < 0) return window.clearTimeout(-id);
  callbacks.delete(id);
  worker?.postMessage([id, -1]);
}

export const steadySleep = (ms: number) =>
  new Promise<void>((resolve) => steadyTimeout(resolve, ms));
