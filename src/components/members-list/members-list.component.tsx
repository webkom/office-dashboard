import MembersListItem from "./members-list-item/members-list-item.component";
import styles from "./members-list.module.css";
import { GithubContributor } from "app/hooks/dashboard-data.hook";
import { Member } from "app/hooks/dashboard-data.hook";
import { OfficeTimes } from "app/hooks/dashboard-data.hook";

export type MemberWithGithubStats = {
  name: string;
  avatar: string;
  github: string;
  github_contributions: {
    lego: number;
    webapp: number;
  };
  brus_data: string;
  kaffe_data: {
    jugs_brewed: number;
    volume_brewed: number;
  };
  birthday: string;
  joined: "" | string;
  first_lego_commit: string;
  activity_today: string;
  first_seen: string;
  is_active: boolean;
  last_seen: string;
  is_pang: boolean;
  office_times: {
    github_name: string;
    total_time: number;
    start_time?: Date;
    end_time?: Date;
    is_office_active: boolean;
  };
};

const MembersList = ({
  githubContributors,
  members,
  officeTimes,
}: {
  githubContributors: GithubContributor[];
  members: Member[];
  officeTimes: OfficeTimes[];
}) => {
  const findGithubStatsOrDefault = (member: Member) => {
    return githubContributors.find(
      (contributor) => contributor.login === member.github,
    );
  };

  const findOfficeTimesForMember = (member: Member) => {
    return officeTimes.find(
      (officeTime) => officeTime.github_name === member.github,
    );
  };

  console.log(members);
  console.log(officeTimes);

  const membersWithGithubStats = members
    .map((member) => {
      const contributionStats = findGithubStatsOrDefault(member);
      const officeTimes = findOfficeTimesForMember(member);

      return {
        name: member.name,
        avatar: member.avatar,
        github: member.github,
        github_contributions: {
          lego: contributionStats?.lego ?? 0,
          webapp: contributionStats?.webapp ?? 0,
        },
        brus_data: "",
        kaffe_data: {
          jugs_brewed: 0,
          volume_brewed: 0,
        },
        birthday: "",
        joined: member.joined,
        first_lego_commit: "",
        activity_today: "",
        first_seen: "",
        is_active: member.active,
        last_seen: "",
        is_pang: !member.active,
        office_times: {
          github_name: officeTimes?.github_name ?? "",
          total_time: officeTimes?.total_time ?? 0,
          start_time: officeTimes?.start_time,
          end_time: officeTimes?.end_time,
          is_office_active: officeTimes?.is_office_active ?? false,
        },
      };
    })
    .sort((m1, m2) => {
      // Prioritize currently active members
      if (
        !!m1.office_times.is_office_active != !!m2.office_times.is_office_active
      ) {
        return m2.office_times.is_office_active &&
          !m1.office_times.is_office_active
          ? 1
          : -1;
      }
      // Prioritize members who have been sitting here longer
      if (
        !!m1.office_times.is_office_active &&
        !!m2.office_times.is_office_active &&
        !!m1.office_times.start_time &&
        !!m2.office_times.start_time
      ) {
        return m1.office_times.start_time > m2.office_times.start_time ? 1 : -1;
      }

      // This shit is buggy
      if (
        !m1.office_times.is_office_active &&
        !m2.office_times.is_office_active
      ) {
        // Prioritize members who have an actual end times
        if (!!m1.office_times.end_time != !!m2.office_times.end_time) {
          return !!m2.office_times.end_time && !m1.office_times.end_time
            ? 1
            : -1;
        }

        // Prioritze members who were most recently seen
        if (!!m1.office_times.end_time && !!m2.office_times.end_time) {
          return m1.office_times.end_time < m2.office_times.end_time ? 1 : -1;
        }
      }

      // Old implementation -> Prioritize active members
      if (m1.is_active != m2.is_active) {
        return m2.is_active && !m1.is_active ? 1 : -1;
      }

      if (m1.joined != m2.joined) {
        if (m2.joined == "") {
          return -1;
        }

        if (m1.joined == "") {
          return 1;
        }

        return new Date(m2.joined).getTime() - new Date(m1.joined).getTime();
      }

      return 0;
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
