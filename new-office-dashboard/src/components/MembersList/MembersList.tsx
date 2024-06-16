import MembersListItem from "./MembersListItem/MembersListItem";
import "./MembersList.css";
import { GithubContributor } from "app/hooks/useGithub";
import { Member } from "app/hooks/useMembers";

export type MemberWithGithubStats = {
  name: string;
  avatar: string;
  github: string;
  github_contributions: number;
  brus_data: string;
  kaffe_data: {
    jugs_brewed: number;
    volume_brewed: number;
  };
  birthday: string;
  joined: string;
  first_lego_commit: string;
  activity_today: string;
  first_seen: string;
  is_active: string;
  last_seen: string;
  is_pang: string;
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

  const createGithubUrl = (username: string) =>
    `https://github.com/${username};`;

  const membersWithGithubStats: MemberWithGithubStats[] = members.map(
    (member) => {
      const contributionStats = findGithubStatsOrDefault(member);

      return {
        name: member.github,
        avatar: member.avatar,
        github: createGithubUrl(member.github),
        github_contributions: contributionStats?.total ?? 0,
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
        is_pang: member.active,
      };
    },
  );

  return (
    <div className="members-list g-flex-col">
      {membersWithGithubStats.map((member) => (
        <MembersListItem key={member.name} member={member} />
      ))}
    </div>
  );
};

export default MembersList;
