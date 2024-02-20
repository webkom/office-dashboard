import { useState } from "react";
import "./index.css";

const styles = (theme) => ({
  container: {
    padding: "10px 0",
    backgroundColor: theme.palette.primary.light,
    boxShadow: "rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset",
    color: "#fff",
  },
  loading: {
    color: theme.palette.secondary.dark,
  },
});

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
  const [isLoading, setIsLoading] = useState(false);

  const statuses = [
    { name: "abakus.no", color: getUptimeRobotColorFromStatus(2) },
    { name: "abakus.no", color: getUptimeRobotColorFromStatus(2) },
  ];

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

  if (isLoading) return <div></div>;

  return (
    <div className="statuses g-width-full g-flex-row g-flex-justify-center g-flex-align-center">
      {statuses.map(({ name, color }) => (
        <StatusItem key={"name"} name={name} color={color} />
      ))}
    </div>
  );
};

export default StatusBar;
