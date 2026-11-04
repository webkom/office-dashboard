// The dashboard backend (office-dashboard-backend), which talks to every other
// service for us
export const DASHBOARD_API = import.meta.env.PROD
  ? "https://dashboard-backend.webkom.dev"
  : (import.meta.env.VITE_DASHBOARD_API ?? "http://127.0.0.1:5000");

// The office LED strip, on the local network. Comma-separate to list fallbacks.
export const WLED_URLS = (
  import.meta.env.VITE_WLED_URL || "http://disco.local,http://192.168.1.67"
)
  .split(",")
  .map((url: string) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);
