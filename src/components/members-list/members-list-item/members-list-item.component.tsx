import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import styles from "./members-list-item.module.css";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";

// ...existing code...
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
    <tr
      className={
        member.is_active
          ? `${styles["members-item"]} ${styles["is-active"]}`
          : `${styles["members-item"]}`
      }
    >
      <td className={`${styles["entry"]} ${styles["avatar"]}`}>
        <img src={member.avatar} alt={`Avatar of ${member.name}`} />
        {member.name}
      </td>
      <td className={`${styles["entry"]} ${styles["contributions"]}`}>
        <div>
          <div>lego: {member.github_contributions.lego}</div>
          <div>webapp: {member.github_contributions.webapp}</div>
        </div>
      </td>
      <td className={`${styles["entry"]} ${styles["total-time"]}`}>
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
      </td>
      <td className={`${styles["entry"]} ${styles["last-seen"]}`}>
        {member.office_times.is_active ? (
          // Show if inSession is true
          <div className={styles["in-session"]}>
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
            {timeAgo(member.office_times.last_seen)}
          </div>
        ) : (
          <div
            className={`${styles["last-seen-never"]} ${styles["last-seen-offline"]}`}
          ></div>
        )}
      </td>
    </tr>
  );
};

export default MembersListItem;
