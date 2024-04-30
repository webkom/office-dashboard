import MembersListItem from "./MembersListItem/MembersListItem";
import "./MembersList.css";
import { GithubContributor } from "app/hooks/useGithub";

export type Member = {
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
}: {
  githubContributors: GithubContributor[];
}) => {
  const members: Member[] = githubContributors.map((contributor) => ({
    name: contributor.login,
    avatar: contributor.avatar_url,
    github: contributor.html_url,
    github_contributions: contributor.total,
    brus_data: "",
    kaffe_data: {
      jugs_brewed: 3,
      volume_brewed: 3,
    },
    birthday: "",
    joined: "",
    first_lego_commit: "",
    activity_today: "",
    first_seen: "",
    is_active: "",
    last_seen: "",
    is_pang: "",
  }));

  return (
    <div className="members-list g-flex-col">
      {members.map((member) => (
        <MembersListItem key={member.name} member={member} />
      ))}
    </div>
  );
};

export default MembersList;
