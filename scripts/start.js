const { spawn } = require("child_process");

const isRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RAILWAY_PROJECT_ID ||
  process.env.RAILWAY_SERVICE_ID
);

const command = isRailway
  ? "node"
  : process.platform === "win32"
    ? "npm.cmd"
    : "npm";
const args = isRailway ? ["server/server.js"] : ["run", "start:next"];

const child = spawn(command, args, {
  stdio: "inherit",
  shell: false,
});

child.on("error", (err) => {
  console.error(`Failed to start: ${command} ${args.join(" ")} (${err.message})`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
