import { config } from "dotenv";
import { spawnSync } from "node:child_process";

config({ path: ".env.local" });
const target = process.env.TEST_DATABASE_URL;
if (!target) throw new Error("Set TEST_DATABASE_URL for a dedicated local PostgreSQL test database.");
const url = new URL(target);
if (!["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !url.pathname.endsWith("_test")) {
  throw new Error("Test migrations require a local PostgreSQL database ending in _test.");
}
if (process.env.E2E_DATABASE_URL && process.env.E2E_DATABASE_URL !== target) {
  throw new Error("Use the same dedicated database for TEST_DATABASE_URL and E2E_DATABASE_URL.");
}
const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
  env: { ...process.env, DATABASE_URL: target }, stdio: "inherit",
});
if (result.error) { console.error("Unable to run Prisma. Install root dependencies first."); process.exitCode = 1; }
else process.exitCode = result.status ?? 1;
