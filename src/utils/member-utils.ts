import {
  BrusBalance,
  GithubContributor,
  MaybeEmpty,
  Member,
  OfficeTimes,
} from "app/hooks/dashboard-data.hook";
import { IsEmpty } from "./is-empty";

const matchesGithub = (officeTimeHandle: string, memberHandle: string) =>
  officeTimeHandle.toLowerCase() === memberHandle.toLowerCase();

export const findGithubStatsOrDefault = (
  member: Member,
  contributors: MaybeEmpty<GithubContributor[]>,
) => {
  if (IsEmpty(contributors)) {
    return null;
  }

  return contributors.find(
    (contributor) => contributor.login === member.github,
  );
};

export const findOfficeTimesForMember = (
  member: Member,
  officeTimes: OfficeTimes[],
) => {
  return officeTimes.find((officeTime) =>
    matchesGithub(officeTime.github_name, member.github),
  );
};

export const isOfficeTimeLeader = (
  member: Member,
  officeTimes: OfficeTimes[],
): boolean => {
  const officeTimeForActiveMember = officeTimes.find(
    (officeTime) =>
      matchesGithub(officeTime.github_name, member.github) && member.active,
  );

  if (!officeTimeForActiveMember) {
    return false;
  }

  const leaderOfficeTime = officeTimes.reduce((leader, current) =>
    current.total_time > leader.total_time ? current : leader,
  );

  return matchesGithub(
    officeTimeForActiveMember.github_name,
    leaderOfficeTime.github_name,
  );
};

export const findBrusBalanceForMember = (
  member: Member,
  brus: BrusBalance[],
) => {
  if (IsEmpty(brus)) {
    return null;
  }

  const brusBalance = brus.find(
    (balance) => balance.github.toLowerCase() === member.github.toLowerCase(),
  );

  return brusBalance ? brusBalance.balance : 0;
};
