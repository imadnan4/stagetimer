import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "server",
          environment: "node",
          include: ["tests/server/**/*.test.js"],
        },
      },
      {
        plugins: [react()],
        resolve: {
          alias: { "@": path.resolve(__dirname, "src") },
        },
        test: {
          name: "frontend",
          environment: "jsdom",
          include: ["tests/frontend/**/*.test.{ts,tsx}"],
          setupFiles: ["tests/frontend/setup.ts"],
        },
      },
    ],
  },
});
