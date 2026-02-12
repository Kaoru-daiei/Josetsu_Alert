import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { accidentsApi } from "./vite-plugin-accidents-api";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), accidentsApi()],
  server: {
    host: true,
  },
});
