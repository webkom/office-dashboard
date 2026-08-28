import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faFire,
  faClock,
  faChartLine,
  faSun,
  faTrophy,
  faListCheck,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./member-detail-panel.module.css";
import { DetailedMemberData } from "app/hooks/dashboard-data.hook";

type Props = {
  detail?: DetailedMemberData;
  isLoading: boolean;
  isError: boolean;
};

type StatProps = {
  icon: IconProp;
  label: string;
  value: string | number;
  tone?: "live" | "muted";
  pulse?: boolean;
};

const DetailStat = ({ icon, label, value, tone, pulse }: StatProps) => (
  <div className={styles["stat"]}>
    <div
      className={`${styles["stat-label"]} ${
        tone === "live"
          ? styles["tone-live"]
          : tone === "muted"
            ? styles["tone-muted"]
            : ""
      }`}
    >
      <FontAwesomeIcon
        className={`${styles["stat-icon"]} ${pulse ? styles["pulse-dot"] : ""}`}
        icon={icon}
      />
      {label}
    </div>
    <div className={styles["stat-value"]}>{value}</div>
  </div>
);

const MemberDetailPanel = ({ detail, isLoading, isError }: Props) => {
  if (isLoading) {
    return (
      <div className={styles["detail-panel"]}>
        <div className={styles["detail-message"]}>
          <FontAwesomeIcon
            className={`${styles["stat-icon"]} ${styles["pulse-dot"]}`}
            icon={faCircle}
          />
          Henter statistikk...
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className={styles["detail-panel"]}>
        <div className={styles["detail-message"]}>
          Ingen detaljert statistikk tilgjengelig
        </div>
      </div>
    );
  }

  const stats = detail.stats ?? ({} as DetailedMemberData["stats"]);
  const isIn = detail.status === "in";

  return (
    <div className={styles["detail-panel"]}>
      <div className={styles["stat-grid"]}>
        <DetailStat
          icon={faCircle}
          tone={isIn ? "live" : "muted"}
          pulse={isIn}
          label={isIn ? "Aktiv nå" : "Status"}
          value={isIn ? "På kontoret" : "Ikke til stede"}
        />
        <DetailStat
          icon={faFire as IconProp}
          label="Nåværende rekke"
          value={`${stats.current_streak ?? 0} d`}
        />
        <DetailStat
          icon={faClock as IconProp}
          label="Denne uken"
          value={`${stats.total_hours_this_week ?? 0} t`}
        />
        <DetailStat
          icon={faChartLine as IconProp}
          label="Totalt"
          value={`${stats.total_hours_alltime ?? 0} t`}
        />
        <DetailStat
          icon={faSun as IconProp}
          label="Snitt ankomst"
          value={stats.average_arrival_time || "-"}
        />
        <DetailStat
          icon={faTrophy as IconProp}
          label="Beste rekke"
          value={`${stats.longest_streak ?? 0} d`}
        />
        <DetailStat
          icon={faListCheck as IconProp}
          label="Antall økter"
          value={stats.total_session_count ?? 0}
        />
      </div>
    </div>
  );
};

export default MemberDetailPanel;
