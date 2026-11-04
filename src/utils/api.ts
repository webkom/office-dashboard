import { DASHBOARD_API } from "app/config";

/** The dashboard only talks to its backend (and the LED strip, which the
 * backend can't reach) */
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DASHBOARD_API}${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}
