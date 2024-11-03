import MembersListItem from "./members-list-item/members-list-item.component";
import styles from "./members-list.module.css";
import { GithubContributor } from "app/hooks/dashboard-data.hook";
import { Member } from "app/hooks/dashboard-data.hook";

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
  total_time: number;
  start_time: Date;
  end_time: Date;
};

const MembersList = ({
  githubContributors,
  members,
}: {
  githubContributors: GithubContributor[];
  members: Member[];
}) => {
  const findGithubStatsOrDefault = (member: Member) => {
    return githubContributors.find(
      (contributor) => contributor.login === member.github,
    );
  };

  const membersWithGithubStats: MemberWithGithubStats[] = members
    .map((member) => {
      const contributionStats = findGithubStatsOrDefault(member);

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
        total_time: member.total_time,
        start_time: member.start_time,
        end_time: member.end_time,
      };
    })
    .sort((m1, m2) => {
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
