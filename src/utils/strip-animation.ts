import type { FrameQueue } from "app/utils/wled-client";
import { steadySleep } from "app/utils/steady-timer";

/** Animates over `ms` paced by wall-clock elapsed time and HTTP completion so
 * slow Wi-Fi responses never queue stale frames. Returns false if `stopped()`. */
export async function animate(
  frames: Pick<FrameQueue, "push" | "idle">,
  steps: number,
  ms: number,
  frameAt: (t: number, step: number) => object,
  stopped: () => boolean = () => false,
): Promise<boolean> {
  if (steps <= 1 || ms <= 0) {
    if (stopped()) return false;
    frames.push(frameAt(1, 0));
    await frames.idle();
    return !stopped();
  }

  const startedAt = Date.now();
  const stepMs = ms / steps;
  let lastStep = -1;

  while (!stopped()) {
    const elapsed = Date.now() - startedAt;
    const t = Math.min(1, elapsed / ms);
    const step = Math.min(steps - 1, Math.round(t * (steps - 1)));

    if (step !== lastStep) {
      lastStep = step;
      frames.push(frameAt(t, step));
      await frames.idle();
    }
    if (stopped()) return false;
    if (t >= 1 && lastStep === steps - 1) return true;

    const nextTarget = Math.min(ms, (lastStep + 1) * stepMs);
    const wait = nextTarget - (Date.now() - startedAt);
    await steadySleep(Math.max(16, wait));
  }
  return false;
}

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
