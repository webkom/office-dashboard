import { useQuery } from "@tanstack/react-query";
import { getJson } from "app/utils/api";

export type UptimeStatus =
  | "up"
  | "seems_down"
  | "down"
  | "paused"
  | "not_checked";
export type Service = { name: string; status: UptimeStatus };

function useUptimeStatus() {
  return useQuery({
    queryKey: ["uptime-status"],
    queryFn: () => getJson<Service[]>("/uptime"),
    retry: 1,
    refetchInterval: 1000 * 30,
  });
}

export { useUptimeStatus };
