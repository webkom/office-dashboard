import type { LatestOnly } from "app/utils/wled-client";
import { steadySleep } from "app/utils/steady-timer";

/** `steps` frames evenly over `ms`; false if `stopped()` cut it short */
export async function animate(
  frames: LatestOnly,
  steps: number,
  ms: number,
  frameAt: (t: number, step: number) => object,
  stopped: () => boolean = () => false,
): Promise<boolean> {
  for (let k = 0; k < steps; k++) {
    if (stopped()) return false;
    frames.push(frameAt(steps === 1 ? 1 : k / (steps - 1), k));
    await steadySleep(ms / steps);
  }
  return !stopped();
}

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeInOutSine = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;
