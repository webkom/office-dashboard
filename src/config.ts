// Dashboard API (defined in main.py)
export const DASHBOARD_API = import.meta.env.PROD
  ? "https://dashboard-backend.webkom.dev"
  : "http://localhost:5012";

// Brus API
export const BRUS_URL =
  import.meta.env.REACT_APP_BRUS_URL || "https://brus.abakus.no/api/liste";

// Presence API  ! Do not work
export const PRESENCE_URL =
  import.meta.env.REACT_APP_PRESENCE_URL || "https://presence.webkom.dev";

// Environment API
export const ENVIRONMENT_URL =
  import.meta.env.REACT_APP_ENVIRONMENT_URL ||
  "https://environment-api.webkom.dev";

// Kaffe API
export const KAFFE_URL =
  import.meta.env.REACT_APP_KAFFE_URL || "https://kaffe-api.webkom.dev";

// Github stats api
export const GITHUB_STATS_API = "https://api.github.com/graphql";

// Github access token
export const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

// Office Door
export const OFFICE_DOOR_URL =
  import.meta.env.REACT_APP_OFFICE_DOOR_URL ||
  "https://office-door-api.webkom.dev";

// Office Chromecast
export const OFFICE_CHROMECAST_URL =
  import.meta.env.REACT_APP_OFFICE_CHROMECAST_URL ||
  "https://office-chromecast-api.webkom.dev";

// Uptime Robot
export const UPTIME_ROBOT_URL =
  import.meta.env.REACT_APP_UPTIME_ROBOT_URL ||
  "https://api.uptimerobot.com/v2/getMonitors";
export const UPTIME_ROBOT_MONITORS = (
  import.meta.env.REACT_APP_UPTIME_ROBOT_MONITORS ||
  "WEBAPP=780718562,LEGO=782661964,WIKI=780718556"
)
  .split(",")
  .map((monitor: string) => monitor.split("="));
export const UPTIME_ROBOT_API_KEY =
  import.meta.env.REACT_APP_UPTIME_ROBOT_API_KEY ||
  "ur609187-58b7ee7d64ca62809bb5e902";
export const UPTIME_ROBOT_POST_DATA = {
  api_key: UPTIME_ROBOT_API_KEY,
  monitors: UPTIME_ROBOT_MONITORS.map(
    (monitor: [string, string]) => monitor[1],
  ).join("-"),
  custom_uptime_rations: 30,
};

//https://api.uptimerobot.com/v2/getMonitors"
//-d "api_key=ur609187-58b7ee7d64ca62809bb5e902&monitors=780718562-782661964-780718556&custom_uptime_ratios=30

// Office Environment Sensors
export const OFFICE_SENSORS = ["sensors/B05DAFC40A24"];
