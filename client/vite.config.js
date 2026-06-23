import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The "proxy" line means: whenever the React app asks for /api/...,
// Vite quietly forwards it to the Express server on port 4000.
// That's why the front-end code can just call fetch("/api/feed").
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
