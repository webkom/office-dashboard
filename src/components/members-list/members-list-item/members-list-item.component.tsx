import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import styles from "./members-list-item.module.css";
import {
  timeAgo,
  calculateSessionTime,
  formatSecondsToHours,
} from "app/utils/timeutils";

// import {
// faCoffee,
// faFlask,
//   type IconDefinition,
// } from "@fortawesome/free-solid-svg-icons";

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { useEffect, useState } from "react";
import moment from "moment-timezone";

type Props = {
  member: MemberWithGithubStats;
};

const MembersListItem = ({ member }: Props) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);
  // type StatsEntryProps = {
  //   icon: IconDefinition;
  //   unit: string;
  //   value: string | number;
  // };
  // const StatEntry = ({ icon, unit, value }: StatsEntryProps) => (
  //   <div className="stats-entry">
  //     <div className="icon-wrapper">
  //       <FontAwesomeIcon className="icon" icon={icon as IconProp} />
  //     </div>
  //     <div className="value">{value}</div>
  //     <div className="unit">{unit}</div>
  //   </div>
  // );

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
        <a>{member.github}</a>
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
          {formatSecondsToHours(member.office_times.total_time)}
        </div>
      </div>
      <div className={`${styles["entry"]} ${styles["last-seen"]}`}>
        {member.office_times.is_active ? (
          // Show if inSession is true
          <div className={styles["in-session"]}>
            In Session: <br />
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
            Sist Sett: <br />
            {timeAgo(member.office_times.last_seen)}
          </div>
        ) : (
          <div
            className={`${styles["last-seen-never"]} ${styles["last-seen-offline"]}`}
          >
            Sist Sett: <br /> Aldri Sett
          </div>
        )}
      </div>
      {/* <div className="entry kaffe">
        <StatEntry
          icon={faCoffee}
          unit="kanner"
          value={member.kaffe_data.jugs_brewed}
        />
        <StatEntry
          icon={faFlask}
          unit="liter"
          value={member.kaffe_data.volume_brewed}
        />
      </div> */}
      {/* <div className="entry brus">
        <StatEntry
          icon={faCoffee}
          unit="Brus"
          value={member.kaffe_data.jugs_brewed}
        />
        <StatEntry
          icon={faFlask}
          unit="Øl"
          value={member.kaffe_data.volume_brewed}
        />
      </div> */}
      {/* <div className="entry office-activity">
        <div className="first-seen">Først sett 88:88:88</div>
        <div className="">12 timer 34 minutter</div>
      </div>
      <div className="entry last-seen">På kontoret!</div> */}
    </div>
  );
};

export default MembersListItem;
