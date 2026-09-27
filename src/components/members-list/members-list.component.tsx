import { useState, useMemo } from "react";
import {
  BrusBalance,
  GithubContributor,
  MaybeEmpty,
  Member,
  OfficeTimes,
} from "app/hooks/dashboard-data.hook";
import { useMemberStats } from "app/hooks/member-stats.hook";
import MembersListItem from "./members-list-item/members-list-item.component";

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

type SortField = "name" | "contributions" | "brus" | "time" | "last_seen";
type SortDirection = "asc" | "desc";

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

  const [selectedGithub, setSelectedGithub] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "active" | "pang">(
    "all",
  );
  const [sortField, setSortField] = useState<SortField>("last_seen");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const activeAtOfficeCount = membersWithGithubStats.filter(
    (m) => m.office_times.is_active,
  ).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  // Filter and sort members
  const processedMembers = useMemo(() => {
    let list = membersWithGithubStats;

    if (filterMode === "active") {
      list = list.filter((m) => m.office_times.is_active);
    } else if (filterMode === "pang") {
      list = list.filter((m) => m.is_pang);
    }

    return [...list].sort((a, b) => {
      const aActive = a.office_times.is_active ? 1 : 0;
      const bActive = b.office_times.is_active ? 1 : 0;

      // The people currently at the office must always be shown at the very top
      if (aActive !== bActive) {
        return bActive - aActive; // 1 (at office) comes before 0 (not at office)
      }

      let comparison = 0;
      if (sortField === "last_seen") {
        const aTime = a.office_times.last_seen
          ? new Date(a.office_times.last_seen).getTime()
          : 0;
        const bTime = b.office_times.last_seen
          ? new Date(b.office_times.last_seen).getTime()
          : 0;
        const validATime = isNaN(aTime) ? 0 : aTime;
        const validBTime = isNaN(bTime) ? 0 : bTime;

        comparison = validATime - validBTime;
      } else if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "contributions") {
        const totalA =
          a.github_contributions.lego +
          a.github_contributions.webapp +
          a.github_contributions.abakus_app;
        const totalB =
          b.github_contributions.lego +
          b.github_contributions.webapp +
          b.github_contributions.abakus_app;
        comparison = totalA - totalB;
      } else if (sortField === "brus") {
        comparison = a.brus_balance - b.brus_balance;
      } else if (sortField === "time") {
        comparison = a.office_times.total_time - b.office_times.total_time;
      }

      if (comparison !== 0) {
        return sortDirection === "asc" ? comparison : -comparison;
      }

      // Tie-breaker: sort by last seen (descending)
      const fallbackATime = a.office_times.last_seen
        ? new Date(a.office_times.last_seen).getTime()
        : 0;
      const fallbackBTime = b.office_times.last_seen
        ? new Date(b.office_times.last_seen).getTime()
        : 0;
      const validFallbackA = isNaN(fallbackATime) ? 0 : fallbackATime;
      const validFallbackB = isNaN(fallbackBTime) ? 0 : fallbackBTime;

      if (validFallbackA !== validFallbackB) {
        return validFallbackB - validFallbackA;
      }

      return a.name.localeCompare(b.name);
    });
  }, [membersWithGithubStats, filterMode, sortField, sortDirection]);

  const activeMembers = processedMembers.filter(
    (m) => !m.is_pang || m.office_times.is_active,
  );
  const pangMembers = processedMembers.filter(
    (m) => m.is_pang && !m.office_times.is_active,
  );

  return (
    <div className="p-2 win95-font flex flex-col gap-2">
      {/* Search and Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#c0c0c0] p-1.5 win95-status-inset">
        {/* Filter Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode("all")}
            className={`win95-btn text-[11px] ${
              filterMode === "all" ? "win95-btn-active font-bold active" : ""
            }`}
          >
            Alle ({membersWithGithubStats.length})
          </button>
          <button
            onClick={() => setFilterMode("active")}
            className={`win95-btn text-[11px] ${
              filterMode === "active" ? "win95-btn-active font-bold active" : ""
            }`}
          >
            🟢 På kontoret ({activeAtOfficeCount})
          </button>
          <button
            onClick={() => setFilterMode("pang")}
            className={`win95-btn text-[11px] ${
              filterMode === "pang" ? "win95-btn-active font-bold active" : ""
            }`}
          >
            Pang ({membersWithGithubStats.filter((m) => m.is_pang).length})
          </button>
        </div>
      </div>

      {/* Main Table Viewport (SysListView32 Style) */}
      <div className="win95-inset bg-white overflow-x-auto max-h-[65vh] win95-scroll">
        <table className="win95-table w-full">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="w-1/3 cursor-pointer"
                title="Sorter etter navn"
              >
                Navn {getSortIndicator("name")}
              </th>
              <th
                onClick={() => handleSort("contributions")}
                className="hidden md:table-cell cursor-pointer"
                title="Sorter etter bidrag"
              >
                Bidrag (Lego / Webapp / App) {getSortIndicator("contributions")}
              </th>
              <th
                onClick={() => handleSort("brus")}
                className="text-right cursor-pointer"
                title="Sorter etter saldo i brusautomaten"
              >
                Brus {getSortIndicator("brus")}
              </th>
              <th
                onClick={() => handleSort("time")}
                className="cursor-pointer"
                title="Sorter etter total tid på kontoret"
              >
                Total tid {getSortIndicator("time")}
              </th>
              <th
                onClick={() => handleSort("last_seen")}
                className="text-left cursor-pointer"
                title="Sorter etter sist sett / aktiv status"
              >
                Sist sett {getSortIndicator("last_seen")}
              </th>
            </tr>
          </thead>
          <tbody>
            {processedMembers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-gray-500 italic"
                >
                  Ingen medlemmer matcher kriteriene.
                </td>
              </tr>
            ) : filterMode === "all" ? (
              <>
                {/* Active members */}
                {activeMembers.map((member) => (
                  <MembersListItem
                    key={member.github}
                    member={member}
                    isSelected={selectedGithub === member.github}
                    onSelect={() =>
                      setSelectedGithub((prev) =>
                        prev === member.github ? null : member.github,
                      )
                    }
                  />
                ))}

                {/* Pang group divider if present */}
                {pangMembers.length > 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="bg-[#c0c0c0] font-bold text-[11px] py-1 px-3 border-y border-[#808080]"
                      style={{
                        boxShadow: "inset 0 1px 0 #fff",
                        color: "#333",
                      }}
                    >
                      ── Tidligere medlemmer (Pang) ──
                    </td>
                  </tr>
                )}

                {pangMembers.map((member) => (
                  <MembersListItem
                    key={member.github}
                    member={member}
                    isSelected={selectedGithub === member.github}
                    onSelect={() =>
                      setSelectedGithub((prev) =>
                        prev === member.github ? null : member.github,
                      )
                    }
                  />
                ))}
              </>
            ) : (
              processedMembers.map((member) => (
                <MembersListItem
                  key={member.github}
                  member={member}
                  isSelected={selectedGithub === member.github}
                  onSelect={() =>
                    setSelectedGithub((prev) =>
                      prev === member.github ? null : member.github,
                    )
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList;
