import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import styles from "./members-list-item.module.css";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

type Props = {
  member: MemberWithGithubStats;
};

const MembersListItem = ({ member }: Props) => {
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
      className={
        member.is_active
          ? `${styles["members-item"]} ${styles["is-active"]} g-flex-row`
          : `${styles["members-item"]} g-flex-row`
      }
    >
      <div className={`${styles["entry"]} ${styles["avatar"]}`}>
        <img src={member.avatar} />
      </div>
      <div className={`${styles["entry"]} ${styles["name"]}`}>
        {member.name}
      </div>
      <div className={`${styles["entry"]} ${styles["github"]}`}>
        <FontAwesomeIcon
          className={styles["github-icon"]}
          icon={faGithub as IconProp}
        />
        <a
          href={`https://github.com/${member.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {member.github}
        </a>
      </div>
      <div className={`${styles["entry"]} ${styles["contributions"]}`}>
        <div>
          <div>lego: {member.github_contributions.lego}</div>
          <div>webapp: {member.github_contributions.webapp}</div>
        </div>
      </div>
      <div className={`${styles["entry"]} ${styles["total-time"]}`}>
        <div>
          Total Tid: <br />{" "}
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
            På kontoret <br />
            {calculateSessionTime(
              member.office_times.current_session_duration,
              currentTime,
              member.office_times.last_seen,
            )}
          </div>
        ) : member.office_times.last_seen ? (
          <div
            className={`${styles["last-seen-time"]} ${styles["last-seen-offline"]}`}
          >
            Sist sett: <br />
            {timeAgo(member.office_times.last_seen)}
          </div>
        ) : (
          <div
            className={`${styles["last-seen-never"]} ${styles["last-seen-offline"]}`}
          >
            Sist sett: <br /> -
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersListItem;
