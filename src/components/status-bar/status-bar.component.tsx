import { useUptimeStatus } from "app/hooks/uptime-status.hook";
import styles from "./status-bar.module.css";

const statusColors = {
  paused: "#ff0000", // TODO
  not_checked: "#ff0000", // TODO
  up: "#80BA27",
  seems_down: "#ffd000",
  down: "#ff0000",
};

const getUptimeRobotColorFromStatus = (status: number) => {
  switch (status) {
    case 0:
      return statusColors.paused;
    case 1:
      return statusColors.not_checked;
    case 2:
      return statusColors.up;
    case 8:
      return statusColors.seems_down;
    case 9:
      return statusColors.down;
    default:
      return statusColors.paused;
  }
};

const StatusBar = () => {
  const { data, isLoading } = useUptimeStatus();

  const statuses = isLoading
    ? []
    : (data?.monitors.map((monitor) => ({
        name: monitor.friendly_name,
        color: getUptimeRobotColorFromStatus(monitor.status),
      })) ?? []);

  type StatusItemProps = {
    name: string;
    color: string;
  };

  const StatusItem = ({ name, color }: StatusItemProps) => (
    <div
      className={`flex flex-row text-foreground justify-center items-center gap-2.5`}
    >
      <div
        className={`${styles["status-item-icon"]}`}
        style={{ backgroundColor: color }}
      />
      <div className={`${styles["status-item-name"]}`}>{name}</div>
    </div>
  );

  return (
    <div
      className={`${styles["statuses-background"]} g-flex-row g-flex-align-center`}
    >
      <div
        className={`flex flex-row gap-5 bg-card border-border border w-fit py-2.5 px-5 rounded-full mx-auto`}
      >
        {statuses.map(({ name, color }) => (
          <StatusItem key={name} name={name} color={color} />
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
