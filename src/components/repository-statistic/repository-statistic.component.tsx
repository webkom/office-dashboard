import styles from "./repository-statistic.module.css";
import type { Icon } from "@primer/octicons-react";

type Props = {
  height: number;
  name: string;
  Icon: Icon;
  value: string | number;
};

const RepositoryStatistic = ({ height, name, Icon, value }: Props) => (
  <div
    className={`${styles["stats"]} g-flex-row g-flex-align-center`}
    style={{ height: `${height}%` }}
  >
    <Icon className={styles["icon"]} />
    <div className={`${styles["text-and-value"]} g-flex-row`}>
      <div className={`${styles["text"]} g-flex`}>
        {name !== null ? `${name}:` : "==>"}
      </div>
      <div className={styles["value"]}>{value}</div>
    </div>
  </div>
);

export default RepositoryStatistic;
