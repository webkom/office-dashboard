import {
  BrusBalance,
  GithubContributor,
  MaybeEmpty,
  Member,
  OfficeTimes,
} from "app/hooks/dashboard-data.hook";
import { useMemberStats } from "app/hooks/member-stats.hook";
import MembersListItem from "./members-list-item/members-list-item.component";
import { ComponentProps } from "react";
import { cn } from "app/utils/cn";

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

const MembersTable = ({
  membersWithGithubStats,
  className,
  showHeader = true,
  ...props
}: {
  membersWithGithubStats: MemberWithGithubStats[];
  showHeader?: boolean;
} & ComponentProps<"table">) => {
  return (
    <table
      className={cn("w-full text-left border-collapse", className)}
      {...props}
    >
      {showHeader && (
        <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold tracking-wider border-b border-border/40">
          <tr>
            <th scope="col" className="py-3.5 px-4 sm:px-6">
              Navn
            </th>
            <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
              Bidrag
            </th>
            <th scope="col" className="py-3.5 px-4 text-right">
              Brus
            </th>
            <th scope="col" className="py-3.5 px-4">
              Total tid
            </th>
            <th
              scope="col"
              className="py-3.5 px-4 sm:px-6 text-right sm:text-left"
            >
              Sist sett
            </th>
          </tr>
        </thead>
      )}
      <tbody>
        {membersWithGithubStats.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="py-12 text-center text-muted-foreground text-sm"
            >
              Ingen medlemmer funnet
            </td>
          </tr>
        ) : (
          membersWithGithubStats.map((member) => (
            <MembersListItem key={member.github} member={member} />
          ))
        )}
      </tbody>
    </table>
  );
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

  const activeAtOfficeCount = membersWithGithubStats.filter(
    (m) => m.office_times.is_active,
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header with Title and Status Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Medlemmer
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Oversikt over aktivitet, bidrag og tid på kontoret
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            {activeAtOfficeCount} på kontoret
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/30">
            {membersWithGithubStats.length} medlemmer
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg">
        <div className="overflow-x-auto">
          <MembersTable
            membersWithGithubStats={membersWithGithubStats.filter(
              (m) => !m.is_pang,
            )}
          />
          <div className="w-full h-5 bg-muted my-2 text-center" />
          <MembersTable
            showHeader={false}
            membersWithGithubStats={membersWithGithubStats.filter(
              (m) => m.is_pang,
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default MembersList;
