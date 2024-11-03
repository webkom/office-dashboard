import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemberWithGithubStats } from "../members-list.component";
import styles from "./members-list-item.module.css";
// import {
// faCoffee,
// faFlask,
//   type IconDefinition,
// } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

type Props = {
  member: MemberWithGithubStats;
};
const MembersListItem = ({ member }: Props) => {
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
      <div className={`${styles["entry"]} ${styles["office_times"]}`}>
        <div className={`${styles["longest-session"]}`}>Total: 00t 00min</div>
        <div className={`${styles["total-time"]}`}>Longest session: 00:00</div>
      </div>
      <div className={`${styles["last-seen"]}`}>
        In session: <br /> 00H 00M
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
