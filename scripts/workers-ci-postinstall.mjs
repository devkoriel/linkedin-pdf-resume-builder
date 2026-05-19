import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (process.env.WORKERS_CI !== "1") {
  process.exit(0);
}

if (process.env.SKIP_WORKERS_CI_POSTINSTALL_BUILD === "1") {
  console.log("Skipping Workers Builds postinstall build.");
  process.exit(0);
}

if (existsSync(".open-next/worker.js")) {
  console.log("OpenNext Worker output already exists.");
  process.exit(0);
}

console.log("Workers Builds detected. Generating OpenNext Worker output.");

const result = spawnSync("npx", ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
