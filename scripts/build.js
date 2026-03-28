const { spawnSync } = require("child_process");

const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID
);

if (isRailway) {
  console.log("Railway backend deployment detected; skipping Next.js build.");
  process.exit(0);
}

const npmRunner = process.platform === "win32" ? "npm.cmd" : "npm";

const result = spawnSync(npmRunner, ["run", "build:next"], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
