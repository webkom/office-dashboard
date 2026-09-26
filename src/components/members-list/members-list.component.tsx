import {
  BrusBalance,
  GithubContributor,
  MaybeEmpty,
  Member,
  OfficeTimes,
} from "app/hooks/dashboard-data.hook";
import { useMemberStats } from "app/hooks/member-stats.hook";
import MembersListItem from "./members-list-item/members-list-item.component";
import styles from "./members-list.module.css";

export type MemberWithGithubStats = {
  name: string;
  avatar: string;
  github: string;
  github_contributions: { lego: number; webapp: number; abakus_app: number };
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
  const membersWithGithubStats = useMemberStats({
    members,
    brus,
    contributors: githubContributors,
    officeTimes,
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
