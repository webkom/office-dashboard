import { useQuery } from "@tanstack/react-query";
import { PALANTIR_API } from "app/config";
import type { OfficeTimes } from "./dashboard-data.hook";

type PalantirMember = {
  member: string;
  status: "in" | "out";
  arrived_at?: string;
  last_seen?: string;
};

const fetchPalantirOfficeTimes = async (): Promise<OfficeTimes[]> => {
  const [membersRes, leaderboardRes] = await Promise.all([
    fetch(`${PALANTIR_API}/members`),
    fetch(`${PALANTIR_API}/stats/leaderboard`),
  ]);

  if (!membersRes.ok || !leaderboardRes.ok) {
    throw new Error("Fetching Palantir data failed");
  }

  const members = (await membersRes.json()) as PalantirMember[];
  const leaderboard = (await leaderboardRes.json()) as {
    all_time: { member: string; hours: number }[];
  };

  const totalHoursByMember = Object.fromEntries(
    (leaderboard.all_time ?? []).map((e) => [e.member, e.hours]),
  );

  return members.map(
    (m): OfficeTimes => ({
      github_name: m.member,
      is_active: m.status === "in" ? 1 : 0,
      last_seen: m.status === "in" ? m.arrived_at : m.last_seen,
      current_session_duration: 0,
      total_time: Math.round((totalHoursByMember[m.member] ?? 0) * 3600),
    }),
  );
};

export function usePalantirData() {
  return useQuery({
    queryKey: ["palantir-presence"],
    queryFn: fetchPalantirOfficeTimes,
    retry: 1,
    refetchInterval: 1000 * 60 * 2,
  });
}
