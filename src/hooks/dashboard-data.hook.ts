import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_API } from "app/config";

export type Member = {
  name: string;
  full_name: string;
  birthday: string;
  joined: "" | string;
  first_lego_commit: string;
  avatar: string;
  slack: string;
  phone_number: string;
  github: string;
  duolingo: string;
  brus: string;
  active: boolean;
  new: string;
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
  repository_stats: { lego: RepositoryStats; webapp: RepositoryStats };
  repository_contributors: GithubContributor[];
};

export type GithubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  lego?: number;
  webapp?: number;
};

const fetchDashboardData = async () => {
  const res = await fetch(DASHBOARD_API, {});

  if (!res.ok) {
    throw new Error("Fetching of dashboard failed");
  }

  const data = (await res.json()) as DashboardData;
  return data;
};

function useDashboardData() {
  const queryResult = useQuery({
    queryKey: ["dashboard-backend"],
    queryFn: fetchDashboardData,
    retry: 1,
    refetchInterval: 1000 * 60 * 2,
  });
  return queryResult;
}

export { useDashboardData };
