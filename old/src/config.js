// GitHub base URL
export const GITHUB_URL =
  process.env.REACT_APP_GITHUB_URL || 'https://github.com';

// Brus API
export const BRUS_URL =
  process.env.REACT_APP_BRUS_URL || 'https://brus.abakus.no';

// Presence API
export const PRESENCE_URL =
  process.env.REACT_APP_PRESENCE_URL || 'https://presence.webkom.dev';

// Environment API
export const ENVIRONMENT_URL =
  process.env.REACT_APP_ENVIRONMENT_URL || 'https://environment-api.webkom.dev';

// Kaffe API
export const KAFFE_URL =
  process.env.REACT_APP_KAFFE_URL || 'https://kaffe-api.webkom.dev';

// Office Door
export const OFFICE_DOOR_URL =
  process.env.REACT_APP_OFFICE_DOOR_URL || 'https://office-door-api.webkom.dev';

// Office Chromecast
export const OFFICE_CHROMECAST_URL =
  process.env.REACT_APP_OFFICE_CHROMECAST_URL ||
  'https://office-chromecast-api.webkom.dev';

// GitHub stats
export const GITHUB_STATS_URL =
  process.env.REACT_APP_GITHUB_STATS_URL || 'https://github-stats.webkom.dev';

// Uptime Robot
export const UPTIME_ROBOT_URL =
  process.env.REACT_APP_UPTIME_ROBOT_URL ||
  'https://api.uptimerobot.com/v2/getMonitors';
export const UPTIME_ROBOT_MONITORS = (
  process.env.REACT_APP_UPTIME_ROBOT_MONITORS ||
  'WEBAPP=780718562,LEGO=782661964,WIKI=780718556'
)
  .split(',')
  .map(monitor => monitor.split('='));
export const UPTIME_ROBOT_API_KEY =
  process.env.REACT_APP_UPTIME_ROBOT_API_KEY ||
  'ur609187-58b7ee7d64ca62809bb5e902';
export const UPTIME_ROBOT_POST_DATA = {
  api_key: UPTIME_ROBOT_API_KEY,
  monitors: UPTIME_ROBOT_MONITORS.map(monitor => monitor[1]).join('-'),
  custom_uptime_rations: 30
};

//https://api.uptimerobot.com/v2/getMonitors"
//-d "api_key=ur609187-58b7ee7d64ca62809bb5e902&monitors=780718562-782661964-780718556&custom_uptime_ratios=30

// Office Environment Sensors
export const OFFICE_SENSORS = ['sensors/B05DAFC40A24'];
