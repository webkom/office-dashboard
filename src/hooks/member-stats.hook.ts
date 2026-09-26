import { MemberWithGithubStats } from "app/components/members-list/members-list.component";
import {
  BrusBalance,
  GithubContributor,
  MaybeEmpty,
  Member,
  OfficeTimes,
} from "./dashboard-data.hook";
import { useMemo } from "react";
import { IsEmpty } from "app/utils/is-empty";

const matchesGithub = (officeTimeHandle: string, memberHandle: string) =>
  officeTimeHandle.toLowerCase() === memberHandle.toLowerCase();

const findGithubStatsOrDefault = (
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

const findOfficeTimesForMember = (
  member: Member,
  officeTimes: OfficeTimes[],
) => {
  return officeTimes.find((officeTime) =>
    matchesGithub(officeTime.github_name, member.github),
  );
};

const isOfficeTimeLeader = (
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

const findBrusBalanceForMember = (member: Member, brus: BrusBalance[]) => {
  if (IsEmpty(brus)) {
    return null;
  }

  const brusBalance = brus.find(
    (balance) => balance.github.toLowerCase() === member.github.toLowerCase(),
  );

  return brusBalance ? brusBalance.balance : 0;
};

export const useMemberStats = ({
  members,
  contributors,
  officeTimes,
  brus,
}: {
  members: Member[];
  contributors: MaybeEmpty<GithubContributor[]>;
  officeTimes: OfficeTimes[];
  brus: BrusBalance[];
}) => {
  const membersWithGithubStats = useMemo(() => {
    return members
      .map<MemberWithGithubStats>((member) => {
        const contributionStats = findGithubStatsOrDefault(
          member,
          contributors,
        );
        const officeTimes_ = findOfficeTimesForMember(member, officeTimes);
        const officeTimeLeader = isOfficeTimeLeader(member, officeTimes);
        const brusBalance = findBrusBalanceForMember(member, brus);

        return {
          name: member.name,
          avatar: member.avatar,
          github: member.github,
          github_contributions: {
            lego: contributionStats?.lego ?? 0,
            webapp: contributionStats?.webapp ?? 0,
            abakus_app: contributionStats?.abakus_app ?? 0,
          },
          brus_balance: brusBalance ?? 0,
          is_active: member.active,
          is_pang: !member.active,
          office_times: {
            total_time: officeTimes_?.total_time ?? 0,
            last_seen: officeTimes_?.last_seen,
            is_active: officeTimes_?.is_active === 1,
            is_office_time_leader: officeTimeLeader,
          },
          last_seen: "",
          birthday: "",
          joined: "",
          first_lego_commit: "",
          activity_today: "",
          first_seen: "",
        };
      })
      .sort((m1, m2) => {
        if (m1.office_times.is_active && m2.office_times.is_active) {
          const m1LastSeen = m1.office_times.last_seen
            ? new Date(m1.office_times.last_seen)
            : null;
          const m2LastSeen = m2.office_times.last_seen
            ? new Date(m2.office_times.last_seen)
            : null;

          if (m1LastSeen && m2LastSeen) {
            return m1LastSeen.getTime() - m2LastSeen.getTime();
          }
        }
        // If only one online show the online member first
        if (m1.office_times.is_active !== m2.office_times.is_active) {
          return !m1.office_times.is_active ? 1 : -1;
        }

        // Members are offline:
        // a) Members are active (newest first)
        if (
          m1.is_active &&
          m2.is_active &&
          m1.office_times.last_seen &&
          m2.office_times.last_seen
        ) {
          return m1.office_times.last_seen < m2.office_times.last_seen ? 1 : -1;
        }

        // b) One of the members has a last_seen (last_seen first)
        if (
          m1.is_active &&
          m1.office_times.last_seen &&
          !m2.office_times.last_seen
        )
          return -1;
        if (
          m2.is_active &&
          m2.office_times.last_seen &&
          !m1.office_times.last_seen
        )
          return 1;

        // 3. Active member without last_seen (before inactive)
        if (m1.is_active !== m2.is_active) {
          return m1.is_active ? -1 : 1;
        }

        // 5. If both is inactive (newest last_seen first)
        if (
          !m1.is_active &&
          !m2.is_active &&
          m1.office_times.last_seen &&
          m2.office_times.last_seen
        ) {
          return m1.office_times.last_seen < m2.office_times.last_seen ? 1 : -1;
        }

        // 6. One inactive with last_seen (one with last_seen first)
        if (
          !m1.is_active &&
          m1.office_times.last_seen &&
          !m2.office_times.last_seen
        )
          return -1;
        if (
          !m2.is_active &&
          m2.office_times.last_seen &&
          !m1.office_times.last_seen
        )
          return 1;

        // 7. Active without last seen should be before inactives
        if (m1.is_active !== m2.is_active) {
          return m1.is_active ? -1 : 1;
        }

        // Alphabetic fallback
        return m1.name.localeCompare(m2.name);
      });
  }, [members, officeTimes]);

  return membersWithGithubStats;
};
