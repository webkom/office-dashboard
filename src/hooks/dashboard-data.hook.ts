import { useQuery } from "@tanstack/react-query";
import { getJson } from "app/utils/api";

export type MaybeEmpty<T> = T | Record<string, never>;

export type Member = {
  name: string;
  avatar: string;
  github: string;
  active: boolean;
  birthday: string;
  welcome_messages: string[];
};

export type BrusBalance = {
  github: string;
  balance: number;
};

export type OfficeTimes = {
  github_name: string;
  total_time: number;
  last_seen: string | undefined;
  current_session_duration: number;
  is_active: 1 | 0;
};

export type RepositoryStats = {
  name: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  forks: number;
  stars: number;
  disk_usage: number;
  watchers: number;
  commits: number;
  commit_comments: number;
  pull_requests_total: number;
  pull_requests_merged: number;
  pull_requests_open: number;
  pull_requests_closed: number;
  issues_total: number;
  issues_open: number;
  issues_closed: number;
};

export type DashboardData = {
  members: Member[];
  repository_stats: MaybeEmpty<{
    lego: RepositoryStats;
    webapp: RepositoryStats;
  }>;
  repository_contributors: MaybeEmpty<GithubContributor[]>;
  office_times: OfficeTimes[];
  brus: BrusBalance[];
};

export type GithubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  lego?: number;
  webapp?: number;
  abakus_app?: number;
};

export type DetailedMemberData = {
  member: string;
  status: "in" | "out";
  arrived_at?: string;
  session_duration?: string;
  stats: MemberStats;
  recent_sessions: RecentSession[];
};

export type MemberStats = {
  total_hours_alltime: number;
  total_hours_this_week: number;
  total_hours_this_month: number;
  total_days_alltime: number;
  total_session_count: number;
  average_hours_per_day: number;
  average_arrival_time: string;
  average_departure_time: string;
  longest_session_ever: string;
  longest_day_ever: string;
  current_streak: number;
  longest_streak: number;
};

export type RecentSession = {
  date: string;
  arrived_at: string;
  departed_at: string | null;
  duration: string;
};


function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-backend"],
    queryFn: () => getJson<DashboardData>("/"),
    retry: 1,
    refetchInterval: 1000 * 60 * 2,
  });
}

/** Who is at the office, checked often so the lights and welcome messages
 * react within half a minute */
function usePresence() {
  return useQuery({
    queryKey: ["presence"],
    queryFn: () => getJson<OfficeTimes[]>("/presence"),
    retry: 1,
    refetchInterval: 1000 * 20,
  });
}

function useDetailedMemberData(gh_user: string, enabled = true) {
  return useQuery({
    queryKey: ["detailed-member", gh_user],
    queryFn: () => getJson<DetailedMemberData>(`/member/${gh_user}`),
    enabled,
  });
}

export { useDashboardData, useDetailedMemberData, usePresence };
