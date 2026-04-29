import { IsEmpty } from "app/utils/is-empty.ts";
import MembersListItem from "./members-list-item/members-list-item.component";
import styles from "./members-list.module.css";
import { BrusBalance, GithubContributor, MaybeEmpty } from "app/hooks/dashboard-data.hook";
import { Member } from "app/hooks/dashboard-data.hook";
import { OfficeTimes } from "app/hooks/dashboard-data.hook";

export type MemberWithGithubStats = {
  name: string;
  avatar: string;
  github: string;
  github_contributions: { lego: number; webapp: number };
  brus_balance: number;
  birthday: string;
  joined: "" | string;
  first_lego_commit: string;
  activity_today: string;
  first_seen: string;
  is_active: boolean;
  last_seen: string;
  is_pang: boolean;
  office_times: {
    total_time: number;
    is_office_time_leader: boolean;
    last_seen?: string;
    is_active: boolean;
  };
};

const MembersList = ({
  githubContributors,
  members,
  officeTimes,
  brus,
}: {
  githubContributors: MaybeEmpty<GithubContributor[]>;
  members: Member[];
  officeTimes: OfficeTimes[];
  brus: BrusBalance[];
}) => {
  const findGithubStatsOrDefault = (member: Member) => {
    if (IsEmpty(githubContributors)) {
      return null;
    }

    return githubContributors.find(
      (contributor) => contributor.login === member.github,
    );
  };

  const matchesGithub = (officeTimeHandle: string, memberHandle: string) =>
    officeTimeHandle.toLowerCase() === memberHandle.toLowerCase();

  const findOfficeTimesForMember = (member: Member) => {
    return officeTimes.find((officeTime) =>
      matchesGithub(officeTime.github_name, member.github),
    );
  };

  const isOfficeTimeLeader = (member: Member): boolean => {
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

  const findBrusBalanceForMember = (member: Member) => {
    if (IsEmpty(brus)) {
      return null;
    }

    const brusBalance = brus.find(
      (balance) => balance.github.toLowerCase() === member.github.toLowerCase()
    );

    return brusBalance ? brusBalance.balance : 0;
  }
  const membersWithGithubStats = members
    .map<MemberWithGithubStats>((member) => {
      const contributionStats = findGithubStatsOrDefault(member);
      const officeTimes = findOfficeTimesForMember(member);
      const officeTimeLeader = isOfficeTimeLeader(member);
      const brusBalance = findBrusBalanceForMember(member);

      return {
        name: member.name,
        avatar: member.avatar,
        github: member.github,
        github_contributions: {
          lego: contributionStats?.lego ?? 0,
          webapp: contributionStats?.webapp ?? 0,
        },
        brus_balance: brusBalance ?? 0,
        birthday: "",
        joined: member.joined,
        first_lego_commit: "",
        activity_today: "",
        first_seen: "",
        is_active: member.active,
        last_seen: "",
        is_pang: !member.active,
        office_times: {
          total_time: officeTimes?.total_time ?? 0,
          last_seen: officeTimes?.last_seen,
          is_active: officeTimes?.is_active === 1,
          is_office_time_leader: officeTimeLeader,
        },
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

  return (
    <div className={`${styles["members-list"]} g-width-full g-flex-col`}>
      <table className={styles["members-table"]}>
        <thead>
          <tr>
            <th className={styles["name"]}>Navn</th>
            <th className={styles["contributions"]}>Bidrag</th>
            <th className={styles["brus-balance"]}>Brus</th>
            <th className={styles["total-time"]}>Total tid</th>
            <th className={styles["last-seen"]}>Sist sett</th>
          </tr>
        </thead>
        <tbody>
          {membersWithGithubStats.map((member) => (
            <MembersListItem key={member.github} member={member} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembersList;
