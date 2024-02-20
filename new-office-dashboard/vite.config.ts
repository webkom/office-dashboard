import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Alias/paths must be updated in both here and in tsconfig.json
    alias: {
      app: path.resolve(__dirname, "./src"),
    },
  },
});
