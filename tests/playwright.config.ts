import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../.env.local", import.meta.url)) });
const runAuth = process.env.RUN_AUTH_E2E === "true";
const databaseUrl = process.env.E2E_DATABASE_URL;
if (runAuth) {
  if (!databaseUrl) throw new Error("Set E2E_DATABASE_URL to a migrated local PostgreSQL database ending in _test.");
  const url = new URL(databaseUrl);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !url.pathname.endsWith("_test")) {
    throw new Error("Authentication browser tests require a dedicated local PostgreSQL database ending in _test.");
  }
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: runAuth ? 1 : undefined,
  testIgnore: runAuth ? [] : ["**/auth.spec.ts", "**/local-ai.spec.ts"],
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI && !runAuth,
    timeout: 180_000,
    env: runAuth ? {
      DATABASE_URL: databaseUrl!,
      BETTER_AUTH_URL: "http://127.0.0.1:3100",
      BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
      ALLOW_LOCAL_HTTP_AUTH: "true",
      LOCAL_AI_ENABLED: process.env.RUN_LOCAL_AI_E2E === "true" ? "true" : "false",
    } : undefined,
  },
});
