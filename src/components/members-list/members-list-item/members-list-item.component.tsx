import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";
import moment from "moment-timezone";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  member: MemberWithGithubStats;
  isSelected?: boolean;
  onSelect?: () => void;
};

const MembersListItem: React.FC<Props> = ({ member, isSelected, onSelect }) => {
  const [currentTime, setCurrentTime] = useState(moment());
  const [imgError, setImgError] = useState(false);

  // Updates current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const avatarSrc =
    member.avatar ||
    (member.github
      ? `https://avatars.githubusercontent.com/${member.github}`
      : "");

  const isActive = member.office_times.is_active;

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer select-none win95-font transition-none ${
        isSelected
          ? "selected bg-[#000080] text-white"
          : isActive
            ? "bg-[#e8f6e8] hover:bg-[#d6eed6]"
            : "hover:bg-[#f0f0f0]"
      }`}
      style={{
        borderBottom: "1px dotted #dfdfdf",
        color: isSelected ? "#ffffff" : "#000000",
      }}
    >
      {/* Navn & Avatar */}
      <td className="py-1.5 px-3">
        <div className="flex items-center gap-2">
          {/* Status LED */}
          <span
            className="w-2.5 h-2.5 rounded-[1px] inline-block shrink-0"
            style={{
              backgroundColor: isActive ? "#00ff00" : "#a0a0a0",
              boxShadow: isActive ? "0 0 3px #00ff00" : undefined,
              border: "1px solid #000000",
            }}
            title={isActive ? "På kontoret nå" : "Ikke på kontoret"}
          />

          {/* Avatar with Win95 sunken frame */}
          <div
            className="w-7 h-7 shrink-0 bg-white flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: "inset 1px 1px 0 #808080, inset -1px -1px 0 #fff",
              border: "1px solid #000",
            }}
          >
            {!imgError && avatarSrc ? (
              <img
                src={avatarSrc}
                alt={member.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                style={{ imageRendering: "auto" }}
              />
            ) : (
              <span className="text-[11px] font-bold text-gray-700">
                {member.name ? member.name.charAt(0).toUpperCase() : "?"}
              </span>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex items-center gap-1.5 min-w-0">
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold hover:underline truncate text-[13px]"
              style={{
                color: isSelected ? "#ffffff" : "#000080",
              }}
            >
              {member.name}
            </a>

            {member.is_pang && (
              <span
                className="text-[9px] px-1 py-0.2 uppercase font-bold shrink-0"
                style={{
                  backgroundColor: isSelected ? "#ffffff" : "#c0c0c0",
                  color: isSelected ? "#000080" : "#555555",
                  boxShadow: isSelected
                    ? "none"
                    : "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                  border: "1px solid #444",
                }}
              >
                Pang
              </span>
            )}

            {isActive && (
              <span
                className="text-[9px] px-1 py-0.2 uppercase font-bold shrink-0"
                style={{
                  backgroundColor: isSelected ? "#00ff00" : "#00aa00",
                  color: isSelected ? "#000000" : "#ffffff",
                  boxShadow:
                    "inset 1px 1px 0 #80ff80, inset -1px -1px 0 #005500",
                }}
              >
                PÅ KONTORET
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Bidrag */}
      <td className="py-1.5 px-3 hidden md:table-cell">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span
            className="px-1.5 py-0.5 win95-status-inset"
            style={{
              backgroundColor: isSelected ? "#000060" : "#dfdfdf",
              color: isSelected ? "#ffffff" : "#000000",
            }}
            title="Lego commits"
          >
            lego:{" "}
            <b
              className={
                member.github_contributions.lego > 0 ? "text-blue-700" : ""
              }
            >
              {member.github_contributions.lego}
            </b>
          </span>
          <span
            className="px-1.5 py-0.5 win95-status-inset"
            style={{
              backgroundColor: isSelected ? "#000060" : "#dfdfdf",
              color: isSelected ? "#ffffff" : "#000000",
            }}
            title="Webapp commits"
          >
            webapp:{" "}
            <b
              className={
                member.github_contributions.webapp > 0 ? "text-green-700" : ""
              }
            >
              {member.github_contributions.webapp}
            </b>
          </span>
          <span
            className="px-1.5 py-0.5 win95-status-inset"
            style={{
              backgroundColor: isSelected ? "#000060" : "#dfdfdf",
              color: isSelected ? "#ffffff" : "#000000",
            }}
            title="Abakus App commits"
          >
            app:{" "}
            <b
              className={
                member.github_contributions.abakus_app > 0
                  ? "text-purple-700"
                  : ""
              }
            >
              {member.github_contributions.abakus_app}
            </b>
          </span>
        </div>
      </td>

      {/* Brus */}
      <td className="py-1.5 px-3 text-right whitespace-nowrap font-mono text-[12px]">
        {member.brus_balance < 0 ? (
          <span
            className="font-bold px-1.5 py-0.5 win95-status-inset inline-block"
            style={{
              color: isSelected ? "#ff9999" : "#cc0000",
              backgroundColor: isSelected ? "#330000" : "#ffebee",
            }}
          >
            {member.brus_balance},-
          </span>
        ) : member.brus_balance > 0 ? (
          <span
            className="font-bold px-1.5 py-0.5 win95-status-inset inline-block"
            style={{
              color: isSelected ? "#99ff99" : "#008800",
              backgroundColor: isSelected ? "#003300" : "#e8f5e9",
            }}
          >
            +{member.brus_balance},-
          </span>
        ) : (
          <span
            className="px-1.5 py-0.5 win95-status-inset inline-block text-gray-600"
            style={{
              backgroundColor: isSelected ? "#000060" : "#f5f5f5",
              color: isSelected ? "#ffffff" : "#555555",
            }}
          >
            0,-
          </span>
        )}
      </td>

      {/* Total tid */}
      <td className="py-1.5 px-3 whitespace-nowrap font-mono text-[12px]">
        <div className="flex items-center gap-1.5">
          {member.office_times.is_office_time_leader && (
            <FontAwesomeIcon
              className="text-amber-500 text-xs shrink-0"
              icon={faCrown as IconProp}
              title="Flest timer på kontoret"
            />
          )}
          <span
            className={
              member.office_times.is_office_time_leader
                ? "font-bold text-amber-700"
                : ""
            }
            style={{
              color: isSelected
                ? member.office_times.is_office_time_leader
                  ? "#ffff55"
                  : "#ffffff"
                : undefined,
            }}
          >
            {formatSecondsToHours(member.office_times.total_time)}
          </span>
        </div>
      </td>

      {/* Sist sett */}
      <td className="py-1.5 px-3 whitespace-nowrap text-right sm:text-left text-[11px]">
        {isActive ? (
          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono font-bold"
            style={{
              backgroundColor: isSelected ? "#004400" : "#c8e6c9",
              color: isSelected ? "#80ff80" : "#1b5e20",
              boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
              border: "1px solid #444",
            }}
          >
            <span>⏱</span>
            <span>
              {calculateSessionTime(currentTime, member.office_times.last_seen)}
            </span>
          </div>
        ) : member.office_times.last_seen ? (
          <span
            style={{
              color: isSelected ? "#dfdfdf" : "#555555",
            }}
          >
            {timeAgo(member.office_times.last_seen)}
          </span>
        ) : (
          <span style={{ color: isSelected ? "#bbbbbb" : "#888888" }}>-</span>
        )}
      </td>
    </tr>
  );
};

export default MembersListItem;
