// Type declarations for non-TS imports and Vite import.meta.env
// Auto-generated to fix missing module/type errors during tsc build

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const content: { [key: string]: string } | string;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

// Vite's import.meta.env typing for used environment variables
interface ImportMetaEnv {
  readonly PROD?: boolean;
  readonly VITE_DASHBOARD_API?: string;
  readonly REACT_APP_BRUS_URL?: string;
  readonly REACT_APP_ENVIRONMENT_URL?: string;
  readonly REACT_APP_KAFFE_URL?: string;
  readonly REACT_APP_OFFICE_DOOR_URL?: string;
  readonly REACT_APP_OFFICE_CHROMECAST_URL?: string;
  readonly REACT_APP_UPTIME_ROBOT_URL?: string;
  readonly REACT_APP_UPTIME_ROBOT_MONITORS?: string;
  readonly REACT_APP_UPTIME_ROBOT_API_KEY?: string;
  // add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

