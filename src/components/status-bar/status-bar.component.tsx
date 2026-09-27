import { useUptimeStatus } from "app/hooks/uptime-status.hook";

const statusColors = {
  paused: "#808080",
  not_checked: "#808080",
  up: "#00ff00",
  seems_down: "#ffff00",
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

const getStatusLabel = (status: number) => {
  switch (status) {
    case 2:
      return "ONLINE";
    case 8:
      return "TREG";
    case 9:
      return "NEDE";
    default:
      return "UKJENT";
  }
};

const StatusBar = () => {
  const { data, isLoading } = useUptimeStatus();

  const statuses = isLoading
    ? [
        { name: "WEBAPP", color: "#00ff00", label: "ONLINE" },
        { name: "LEGO", color: "#00ff00", label: "ONLINE" },
        { name: "WIKI", color: "#00ff00", label: "ONLINE" },
      ]
    : (data?.monitors.map((monitor) => ({
        name: monitor.friendly_name,
        color: getUptimeRobotColorFromStatus(monitor.status),
        label: getStatusLabel(monitor.status),
      })) ?? []);

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 px-2 bg-[#c0c0c0] border-b border-[#808080] win95-font">
      {statuses.map(({ name, color, label }) => (
        <div
          key={name}
          className="win95-status-inset flex items-center gap-1.5 px-2 py-0.5 text-[11px] bg-[#c0c0c0]"
          title={`${name}: ${label}`}
        >
          <span
            className="w-2.5 h-2.5 rounded-[1px] inline-block shrink-0"
            style={{
              backgroundColor: color,
              boxShadow: color === "#00ff00" ? "0 0 3px #00ff00" : undefined,
              border: "1px solid #000000",
            }}
          />
          <span className="font-bold text-black">{name}:</span>
          <span
            className="text-[10px] font-mono"
            style={{
              color: color === "#ff0000" ? "#aa0000" : "#005500",
              fontWeight: "bold",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatusBar;
