import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import styles from "./members-list-item.module.css";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";

import { useCallback, useEffect, useState } from "react";
import moment from "moment-timezone";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronRight, faCrown } from "@fortawesome/free-solid-svg-icons";
import { Accordion } from "@webkom/lego-bricks";
import { useDetailedMemberData } from "app/hooks/dashboard-data.hook";
import MemberDetailPanel from "./member-detail-panel.component";

type Props = {
  member: MemberWithGithubStats;
};

type TriggerProps = {
  onClick: () => void;
  disabled: boolean;
  open: boolean;
  rotateClassName: string;
};

const MembersListRow = ({
  member,
  onClick,
  open,
  rotateClassName,
}: Pick<TriggerProps, "onClick" | "open" | "rotateClassName"> & {
  member: MemberWithGithubStats;
}) => {
  const [currentTime, setCurrentTime] = useState(moment());

  // Updates the current time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment());
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className={`${styles["members-item"]} ${
        member.is_active ? styles["is-active"] : ""
      } ${open ? styles["is-open"] : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`${styles["entry"]} ${styles["avatar"]}`}>
        <img src={member.avatar} alt={`Avatar of ${member.name}`} />
        <a
          href={`https://github.com/${member.github}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {member.name}
        </a>
      </div>
      <div className={`${styles["entry"]} ${styles["contributions"]}`}>
        <div>
          <div>lego: {member.github_contributions.lego}</div>
          <div>webapp: {member.github_contributions.webapp}</div>
        </div>
      </div>
      <div
        className={`${styles["entry"]} ${styles["brus"]} ${
          member.brus_balance < 0
            ? styles["last-seen-offline"]
            : styles["in-session"]
        }`}
      >
        {member.brus_balance}
        ,-
      </div>
      <div className={`${styles["entry"]} ${styles["total-time"]}`}>
        <div>
          <div className={`${styles["total-time-info"]}`}>
            {member.office_times.is_office_time_leader && (
              <FontAwesomeIcon
                className={styles["crown-icon"]}
                icon={faCrown as IconProp}
              />
            )}
            {formatSecondsToHours(member.office_times.total_time)}
          </div>
        </div>
      </div>
      <div className={`${styles["entry"]} ${styles["last-seen"]}`}>
        {member.office_times.is_active ? (
          // Show if inSession is true
          <div className={styles["in-session"]}>
            {calculateSessionTime(currentTime, member.office_times.last_seen)}
          </div>
        ) : member.office_times.last_seen ? (
          <div
            className={`${styles["last-seen-time"]} ${styles["last-seen-offline"]}`}
          >
            {timeAgo(member.office_times.last_seen)}
          </div>
        ) : (
          <div
            className={`${styles["last-seen-never"]} ${styles["last-seen-offline"]}`}
          ></div>
        )}
      </div>
      <div className={`${styles["entry"]} ${styles["chevron"]}`}>
        <FontAwesomeIcon
          className={rotateClassName}
          icon={faChevronRight as IconProp}
        />
      </div>
    </div>
  );
};

const MembersListItem = ({ member }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const Trigger = useCallback(
    ({ onClick, open, rotateClassName }: TriggerProps) => (
      <MembersListRow
        member={member}
        open={open}
        rotateClassName={rotateClassName}
        onClick={() => {
          setIsOpen(!open);
          onClick();
        }}
      />
    ),
    [member],
  );

  const { data, isLoading, isError } = useDetailedMemberData(
    member.github,
    isOpen,
  );

  return (
    <Accordion
      triggerComponent={Trigger}
      wrapperClassName={styles["detail-wrapper"]}
    >
      <MemberDetailPanel
        detail={data}
        isLoading={isLoading}
        isError={isError}
      />
    </Accordion>
  );
};

export default MembersListItem;
