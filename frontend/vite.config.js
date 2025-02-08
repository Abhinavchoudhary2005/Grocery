import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fixes 404 on refresh for SPA (Single Page Application)
    historyFallback: true,
  },
});
