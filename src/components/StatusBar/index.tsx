// import { useState } from "react";
import { useUptimeStatus } from "app/hooks/useUptimeStatus";
import "./index.css";

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
  // const [isLoading, setIsLoading] = useState(false);

  const { data, isLoading } = useUptimeStatus();

  const statuses = isLoading
    ? []
    : data?.monitors.map((monitor) => ({
        name: monitor.friendly_name,
        color: getUptimeRobotColorFromStatus(monitor.status),
      })) ?? [];

  type StatusItemProps = {
    name: string;
    color: string;
  };

  const StatusItem = ({ name, color }: StatusItemProps) => (
    <div className="status-item g-flex-row g-flex-align-center">
      <div
        className="status-item-icon"
        style={{ backgroundColor: color }}
      ></div>
      <div className="status-item-name">{name}</div>
    </div>
  );

  return (
    <div className="statuses g-width-full g-flex-row g-flex-justify-center g-flex-align-center">
      {statuses.map(({ name, color }) => (
        <StatusItem key={name} name={name} color={color} />
      ))}
    </div>
  );
};

export default StatusBar;
