import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { GITHUB_STATS_API, GITHUB_ACCESS_TOKEN } from "app/config";

const GITHUB_STATS_QUERY = gql`
  {
    lego: repository(owner: "webkom", name: "lego") {
      ...RepoFragment
    }
    webapp: repository(owner: "webkom", name: "lego-webapp") {
      ...RepoFragment
    }
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
  fragment RepoFragment on Repository {
    nameWithOwner
    createdAt
    updatedAt
    pushedAt
    forkCount
    diskUsage
    hasIssuesEnabled
    stars: stargazers {
      totalCount
    }
    # collaborators {
    #   totalCount
    # }
    watchers {
      totalCount
    }
    commitComments {
      totalCount
    }
    totalPullRequests: pullRequests {
      totalCount
    }
    mergedPullRequests: pullRequests(states: MERGED) {
      totalCount
    }
    openPullRequests: pullRequests(states: OPEN) {
      totalCount
    }
    closedPullRequests: pullRequests(states: CLOSED) {
      totalCount
    }
    totalIssues: issues {
      totalCount
    }
    openIssues: issues(states: OPEN) {
      totalCount
    }
    closedIssues: issues(states: CLOSED) {
      totalCount
    }
    branches: refs(first: 0, refPrefix: "refs/heads/") {
      totalCount
    }
    primaryLanguage {
      name
    }
    languages(first: 100) {
      totalCount
      totalSize
      edges {
        node {
          ... on Language {
            name
            color
          }
        }
      }
    }
    commits: defaultBranchRef {
      target {
        ... on Commit {
          history(first: 0) {
            totalCount
          }
        }
      }
    }
  }
`;

const fetchGithubStats = async () => {
  const data = await request(
    GITHUB_STATS_API!,
    GITHUB_STATS_QUERY,
    {},
    { Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}` },
  )
    .then((res: any) => res)
    .catch((e) => e);
  return {
    lego: {
      name: "lego",
      created_at: new Date(data["lego"]["createdAt"]).toLocaleDateString(),
      updated_at: new Date(data["lego"]["updatedAt"]).toLocaleDateString(),
      pushed_at: new Date(data["lego"]["pushedAt"]).toLocaleDateString(),
      forks: data["lego"]["forks"],
      stars: data["lego"]["stars"]["totalCount"],
      disk_usage: data["lego"]["diskUsage"],
      watchers: data["lego"]["watchers"]["totalCount"],
      commits: data["lego"]["commits"]["target"]["history"]["totalCount"],
      commit_comments: data["lego"]["commitComments"]["totalCount"],
      pull_requests_total: data["lego"]["totalPullRequests"]["totalCount"],
      pull_requests_merged: data["lego"]["mergedPullRequests"]["totalCount"],
      pull_requests_open: data["lego"]["openPullRequests"]["totalCount"],
      pull_requests_closed: data["lego"]["closedPullRequests"]["totalCount"],
      issues_total: data["lego"]["totalIssues"]["totalCount"],
      issues_open: data["lego"]["openIssues"]["totalCount"],
      issues_closed: data["lego"]["closedIssues"]["totalCount"],
    },
    webapp: {
      name: "webapp",
      created_at: new Date(data["webapp"]["createdAt"]).toLocaleDateString(),
      updated_at: new Date(data["webapp"]["updatedAt"]).toLocaleDateString(),
      pushed_at: new Date(data["webapp"]["pushedAt"]).toLocaleDateString(),
      forks: data["webapp"]["forks"],
      stars: data["webapp"]["stars"]["totalCount"],
      disk_usage: data["webapp"]["diskUsage"],
      watchers: data["webapp"]["watchers"]["totalCount"],
      commits: data["webapp"]["commits"]["target"]["history"]["totalCount"],
      commit_comments: data["webapp"]["commitComments"]["totalCount"],
      pull_requests_total: data["webapp"]["totalPullRequests"]["totalCount"],
      pull_requests_merged: data["webapp"]["mergedPullRequests"]["totalCount"],
      pull_requests_open: data["webapp"]["openPullRequests"]["totalCount"],
      pull_requests_closed: data["webapp"]["closedPullRequests"]["totalCount"],
      issues_total: data["webapp"]["totalIssues"]["totalCount"],
      issues_open: data["webapp"]["openIssues"]["totalCount"],
      issues_closed: data["webapp"]["closedIssues"]["totalCount"],
    },
  };
};

export type GithubContributor = {
  total: number;
  login: string;
  avatar_url: string;
  html_url: string;
};

const fetchGithubCollaborators = async () => {
  const res = await fetch(
    "https://api.github.com/repos/webkom/lego/stats/contributors?per_page=100",
    {
      headers: {
        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
      },
    },
  );

  const rawData = (await res.json()) as any[];

  const data = rawData.map<GithubContributor>((user)  => {
    return {
      total: user.total,
      login: user.author.login,
      avatar_url: user.author.avatar_url,
      html_url: user.author.html_url,
    };
  });
  return data;
};

function useGithubStats() {
  const queryResult = useQuery({
    queryKey: ["githubStats"],
    queryFn: fetchGithubStats,
    retry: 1,
  });
  return queryResult;
}

function useGithubContributors() {
  const useQueryResult = useQuery({
    queryKey: ["contributors"],
    queryFn: fetchGithubCollaborators,
    retry: 1,
    refetchInterval: 1000 * 60 * 2,
  });

  return useQueryResult;
}

export { useGithubStats, useGithubContributors };
