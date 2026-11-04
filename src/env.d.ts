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
  readonly VITE_WLED_URL?: string;
  // add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
