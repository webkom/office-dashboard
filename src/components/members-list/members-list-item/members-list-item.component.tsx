import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  member: MemberWithGithubStats;
};

const MembersListItem = ({ member }: Props) => {
  const [currentTime, setCurrentTime] = useState(moment());
  const [imgError, setImgError] = useState(false);

  // Updates the current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  const avatarSrc =
    member.avatar ||
    (member.github
      ? `https://avatars.githubusercontent.com/${member.github}`
      : "");

  return (
    <tr
      className={`transition-colors border-b border-border/30 last:border-b-0 ${
        member.office_times.is_active
          ? "bg-secondary/10 hover:bg-secondary/15"
          : "hover:bg-muted/30"
      }`}
    >
      {/* Navn & Avatar */}
      <td className="py-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {!imgError && avatarSrc ? (
              <img
                src={avatarSrc}
                alt={member.name}
                onError={() => setImgError(true)}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-border/50 bg-muted"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground ring-1 ring-border/50 uppercase">
                {member.name ? member.name.charAt(0) : "?"}
              </div>
            )}
            {member.office_times.is_active && (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3"
                title="På kontoret nå"
              >
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary ring-2 ring-card" />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-foreground hover:text-primary transition-colors truncate block text-2xl font-light"
              >
                {member.name}
              </a>
              {member.is_pang && (
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-muted text-muted-foreground border border-border/40 shrink-0">
                  Pang
                </span>
              )}
            </div>
            {/* {member.github && (
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground font-mono transition-colors block truncate"
              >
                @{member.github}
              </a>
            )} */}
          </div>
        </div>
      </td>

      {/* Bidrag */}
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/30 text-foreground">
            <span className="text-muted-foreground font-sans text-[11px]">
              lego
            </span>
            <span
              className={
                member.github_contributions.lego > 0
                  ? "font-bold text-foreground"
                  : "text-muted-foreground/60"
              }
            >
              {member.github_contributions.lego}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/30 text-foreground">
            <span className="text-muted-foreground font-sans text-[11px]">
              webapp
            </span>
            <span
              className={
                member.github_contributions.webapp > 0
                  ? "font-bold text-foreground"
                  : "text-muted-foreground/60"
              }
            >
              {member.github_contributions.webapp}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 border border-border/30 text-foreground">
            <span className="text-muted-foreground font-sans text-[11px]">
              app
            </span>
            <span
              className={
                member.github_contributions.abakus_app > 0
                  ? "font-bold text-foreground"
                  : "text-muted-foreground/60"
              }
            >
              {member.github_contributions.abakus_app}
            </span>
          </span>
        </div>
      </td>

      {/* Brus */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        {member.brus_balance < 0 ? (
          <span className="inline-flex items-center justify-end px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-destructive/15 text-destructive border border-destructive/30">
            {member.brus_balance},-
          </span>
        ) : member.brus_balance > 0 ? (
          <span className="inline-flex items-center justify-end px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-secondary/15 text-secondary border border-secondary/30">
            {member.brus_balance},-
          </span>
        ) : (
          <span className="inline-flex items-center justify-end px-2.5 py-0.5 rounded-md text-xs font-mono font-medium text-muted-foreground bg-muted/40 border border-border/30">
            0,-
          </span>
        )}
      </td>

      {/* Total tid */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 text-sm font-mono">
          {member.office_times.is_office_time_leader && (
            <FontAwesomeIcon
              className="text-chart-4 text-xs"
              icon={faCrown as IconProp}
              title="Flest timer på kontoret"
            />
          )}
          <span
            className={
              member.office_times.is_office_time_leader
                ? "font-bold text-foreground"
                : "text-muted-foreground font-medium"
            }
          >
            {formatSecondsToHours(member.office_times.total_time)}
          </span>
        </div>
      </td>

      {/* Sist sett */}
      <td className="py-3 px-4 sm:px-6 whitespace-nowrap text-right sm:text-left">
        {member.office_times.is_active ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span>
              {calculateSessionTime(currentTime, member.office_times.last_seen)}
            </span>
          </div>
        ) : member.office_times.last_seen ? (
          <span className="text-xs text-muted-foreground font-medium">
            {timeAgo(member.office_times.last_seen)}
          </span>
        ) : undefined}
      </td>
    </tr>
  );
};

export default MembersListItem;
