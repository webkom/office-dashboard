import { IsEmpty } from "app/helpers/is-empty";
import MembersListItem from "./members-list-item/members-list-item.component";
import styles from "./members-list.module.css";
import { GithubContributor, MaybeEmpty } from "app/hooks/dashboard-data.hook";
import { Member } from "app/hooks/dashboard-data.hook";
import { OfficeTimes } from "app/hooks/dashboard-data.hook";

export type MemberWithGithubStats = {
  name: string;
  avatar: string;
  github: string;
  github_contributions: { lego: number; webapp: number };
  brus_data: string;
  kaffe_data: { jugs_brewed: number; volume_brewed: number };
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
    current_session_duration: number;
    last_seen?: Date;
    is_active: boolean;
  };
};

const MembersList = ({
  githubContributors,
  members,
  officeTimes,
}: {
  githubContributors: MaybeEmpty<GithubContributor[]>;
  members: Member[];
  officeTimes: OfficeTimes[];
}) => {
  const findGithubStatsOrDefault = (member: Member) => {
    if (IsEmpty(githubContributors)) {
      return null;
    }

    return githubContributors.find(
      (contributor) => contributor.login === member.github,
    );
  };

  const findOfficeTimesForMember = (member: Member) => {
    return officeTimes.find(
      (officeTime) => officeTime.github_name === member.github,
    );
  };

  const isOfficeTimeLeader = (member: Member): boolean => {
    // Find the office time record for the member
    const officeTimeForActiveMember = officeTimes.find(
      (officeTime) => officeTime.github_name === member.github && member.active,
    );

    if (!officeTimeForActiveMember) {
      // If no office time record is found, return false
      return false;
    }

    // Check if the member has the highest total_time
    const leaderOfficeTime = officeTimes.reduce((leader, current) =>
      current.total_time > leader.total_time ? current : leader,
    );

    return (
      officeTimeForActiveMember.github_name === leaderOfficeTime.github_name
    );
  };

  const membersWithGithubStats = members
    .map<MemberWithGithubStats>((member) => {
      const contributionStats = findGithubStatsOrDefault(member);
      const officeTimes = findOfficeTimesForMember(member);
      const officeTimeLeader = isOfficeTimeLeader(member);

      return {
        name: member.name,
        avatar: member.avatar,
        github: member.github,
        github_contributions: {
          lego: contributionStats?.lego ?? 0,
          webapp: contributionStats?.webapp ?? 0,
        },
        brus_data: "",
        kaffe_data: { jugs_brewed: 0, volume_brewed: 0 },
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
          current_session_duration: officeTimes?.current_session_duration ?? 0,
          is_active: officeTimes?.is_active === 1,
          is_office_time_leader: officeTimeLeader,
        },
      };
    })
    .sort((m1, m2) => {
      // Order present members by current session duration
      if (m1.office_times.is_active && m2.office_times.is_active) {
        return (
          m2.office_times.current_session_duration -
          m1.office_times.current_session_duration
        );
      }
      // Order present members before absent members
      if (m1.office_times.is_active !== m2.office_times.is_active) {
        return !m1.office_times.is_active ? 1 : -1;
      }
      // Order absent members by last seen date
      if (!m1.office_times.is_active && !m2.office_times.is_active) {
        if (m1.office_times.last_seen && m2.office_times.last_seen) {
          return m1.office_times.last_seen < m2.office_times.last_seen ? 1 : -1;
        }
        if (m1.office_times.last_seen) {
          return -1;
        }
        if (m2.office_times.last_seen) {
          return 1;
        }
      }
      // Order absent members with no last seen date by active status
      if (m1.is_active !== m2.is_active) {
        return m2.is_active ? 1 : -1;
      }
      // Lastly, order by name
      return m1.name.localeCompare(m2.name);
    });

  return (
    <div className={`${styles["members-list"]} g-width-full g-flex-col`}>
      {membersWithGithubStats.map((member) => (
        <MembersListItem key={member.github} member={member} />
      ))}
    </div>
  );
};

export default MembersList;
