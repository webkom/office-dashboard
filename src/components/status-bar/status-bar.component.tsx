import { UptimeStatus, useUptimeStatus } from "app/hooks/uptime-status.hook";
import styles from "./status-bar.module.css";

const statusColors: Record<UptimeStatus, string> = {
  paused: "#ff0000", // TODO
  not_checked: "#ff0000", // TODO
  up: "#80BA27",
  seems_down: "#ffd000",
  down: "#ff0000",
};

const StatusBar = () => {
  const { data, isLoading } = useUptimeStatus();

  const statuses = isLoading
    ? []
    : (data?.map((service) => ({
        name: service.name,
        color: statusColors[service.status] ?? statusColors.paused,
      })) ?? []);

  type StatusItemProps = {
    name: string;
    color: string;
  };

  const StatusItem = ({ name, color }: StatusItemProps) => (
    <div className={`${styles["status-item"]} g-flex-row g-flex-align-center`}>
      <div
        className={`${styles["status-item-icon"]}`}
        style={{ backgroundColor: color }}
      ></div>
      <div className={`${styles["status-item-name"]}`}>{name}</div>
    </div>
  );

  return (
    <div
      className={`${styles["statuses-background"]} g-flex-row g-flex-align-center`}
    >
      <div className={`${styles["statuses"]} g-flex-row g-flex-align-center`}>
        {statuses.map(({ name, color }) => (
          <StatusItem key={name} name={name} color={color} />
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
