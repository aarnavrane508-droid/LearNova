import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
const checkOnly = process.argv.includes("--check");
const existingPostgres = process.argv.includes("--existing-postgres");

class SetupError extends Error {}

function checkPrerequisites() {
  const checks = {
    prismaInstalled: existsSync("node_modules/prisma/package.json"),
    authInstalled: existsSync("node_modules/better-auth/package.json"),
    postgresDriverInstalled: existsSync("node_modules/pg/package.json"),
    prismaClientGenerated: existsSync("src/generated/prisma/client.ts"),
    environmentFilePresent: existsSync(".env.local"),
    testRunnerInstalled: existsSync("tests/node_modules/vitest/package.json"),
  };
  console.log(JSON.stringify(checks, null, 2));
  console.log("These file checks do not verify database migrations or authentication.");
  process.exitCode = Object.values(checks).every(Boolean) ? 0 : 1;
}

function command(executable, args, label) {
  console.log(`\n${label}`);
  const result = spawnSync(executable, args, { cwd: root, env: process.env, stdio: "inherit" });
  if (result.error || result.status !== 0) throw new SetupError(`${label} failed. Review the command output above.`);
}

function npm(commandText) {
  // Command text is selected from fixed literals in this file, never user input.
  command("cmd.exe", ["/d", "/s", "/c", `npm.cmd ${commandText}`], `npm ${commandText}`);
}

function developmentUrl(value, suffix) {
  let url;
  try { url = new URL(value); }
  catch { throw new SetupError("A configured database URL is invalid. Check .env.local; do not paste credentials into chat."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !new RegExp(`^/[a-zA-Z_][a-zA-Z0-9_]*${suffix}$`).test(url.pathname)) {
    throw new SetupError(`Local setup requires a local PostgreSQL database ending in ${suffix}.`);
  }
  if (url.username === "USER" || url.password === "PASSWORD" || !url.username || !url.password) {
    throw new SetupError("Replace placeholder database credentials in .env.local before setup.");
  }
  return url;
}

function initializeEnvironment() {
  if (!existsSync(".env.local")) {
    if (existingPostgres) throw new SetupError("Configure .env.local for your existing PostgreSQL instance first. See docs/SETUP.md.");
    if (!/^\.env\*\r?$/m.test(readFileSync(".gitignore", "utf8"))) {
      throw new SetupError("Refusing to write development secrets: .env files must be ignored by Git.");
    }
    const password = randomBytes(36).toString("base64url");
    const values = {
      DATABASE_URL: `postgresql://coolearn:${password}@localhost:5432/coolearn_dev?schema=public`,
      POSTGRES_USER: "coolearn", POSTGRES_PASSWORD: password, POSTGRES_DB: "coolearn_dev",
      BETTER_AUTH_URL: "http://localhost:3000", BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
      ALLOW_LOCAL_HTTP_AUTH: "false", ALLOW_DEV_SEED: "false", SEED_PASSWORD: "",
      TEST_DATABASE_URL: `postgresql://coolearn:${password}@localhost:5432/coolearn_test?schema=public`,
      E2E_DATABASE_URL: `postgresql://coolearn:${password}@localhost:5432/coolearn_test?schema=public`,
      RUN_AUTH_E2E: "false", OPENAI_API_KEY: "",
    };
    const text = "# Local development secrets. Never commit this file.\n" +
      Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n";
    // Exclusive creation prevents overwriting a file created concurrently.
    writeFileSync(".env.local", text, { flag: "wx", mode: 0o600 });
    console.log("Created ignored .env.local with random local secrets. No secret values are printed.");
  } else console.log("Preserving your existing .env.local.");
  process.loadEnvFile(".env.local");
}

async function prepareTestDatabase(databaseUrl, testUrl) {
  const { Client } = await import("pg");
  const testName = testUrl.pathname.slice(1);
  const client = new Client({ connectionString: databaseUrl.href, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [testName]);
    if (result.rowCount === 0) {
      // The identifier was restricted to ASCII letters, digits, and underscores.
      await client.query(`CREATE DATABASE "${testName}"`);
      console.log("Created the dedicated local test database. Existing databases were preserved.");
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
    throw new SetupError(`PostgreSQL/test database setup failed (${code}). Check credentials and CREATEDB permission locally.`);
  } finally { await client.end(); }
}

async function setup() {
  if (checkOnly) { checkPrerequisites(); return; }
  if (process.env.CODEX_SANDBOX_NETWORK_DISABLED === "1") {
    throw new SetupError("Run scripts\\setup-local.cmd in your own Windows terminal. This agent session blocks downloads.");
  }
  if (process.platform !== "win32") throw new SetupError("This wrapper targets Windows; use the commands in docs/SETUP.md on other platforms.");
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (major < 22 || (major === 22 && minor < 12)) throw new SetupError("Node.js 22.12 or newer is required.");
  if (process.env.NODE_ENV === "production") throw new SetupError("Local setup refuses production NODE_ENV.");
  if (!existingPostgres) {
    const docker = spawnSync("docker", ["info"], { stdio: "ignore" });
    if (docker.error || docker.status !== 0) {
      throw new SetupError("Install and start Docker Desktop first, or configure local PostgreSQL and pass --existing-postgres. See docs/SETUP.md.");
    }
  }
  initializeEnvironment();
  const development = developmentUrl(process.env.DATABASE_URL, "_dev");
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32 || !process.env.BETTER_AUTH_URL) {
    throw new SetupError("Set BETTER_AUTH_SECRET and BETTER_AUTH_URL in .env.local. Existing values are not overwritten.");
  }
  const derivedTest = new URL(development.href);
  derivedTest.pathname = development.pathname.replace(/_dev$/, "_test");
  const test = developmentUrl(process.env.TEST_DATABASE_URL || derivedTest.href, "_test");
  if (test.host !== development.host || test.username !== development.username || test.password !== development.password) {
    throw new SetupError("Use the same local PostgreSQL instance and credentials for development and test setup.");
  }
  if (process.env.E2E_DATABASE_URL && process.env.E2E_DATABASE_URL !== test.href) {
    throw new SetupError("TEST_DATABASE_URL and E2E_DATABASE_URL must identify the same local test database.");
  }
  process.env.TEST_DATABASE_URL = test.href;
  process.env.E2E_DATABASE_URL = test.href;
  if (!existingPostgres) {
    if (process.env.POSTGRES_USER !== decodeURIComponent(development.username) ||
        process.env.POSTGRES_PASSWORD !== decodeURIComponent(development.password) ||
        process.env.POSTGRES_DB !== development.pathname.slice(1) || (development.port && development.port !== "5432")) {
      throw new SetupError("Docker POSTGRES settings must match DATABASE_URL on port 5432. Existing credentials are preserved.");
    }
    command("docker", ["compose", "--env-file", ".env.local", "up", "-d", "--wait", "--wait-timeout", "60", "postgres"], "Start the existing PostgreSQL compose service");
  }
  npm("install");
  npm("run test:install");
  npm("run db:validate");
  npm("run db:generate");
  npm("run db:migrate");
  await prepareTestDatabase(development, test);
  npm("run db:test:prepare");
  npm("run check");
  npm("run test:policies");
  npm("test");
  npm("run test:db");
  npm("--prefix tests run browsers:install");
  process.env.RUN_AUTH_E2E = "true";
  // Existing Playwright configuration builds the production app and tests real auth.
  npm("run test:e2e");
  console.log("\nLocal setup and the existing Phase 01 checks completed. Review the test output before proceeding to Phase 02.");
}

setup().catch((error) => {
  console.error(error instanceof SetupError ? error.message : "Setup failed unexpectedly. Check the last displayed step; credentials are not printed.");
  process.exitCode = 1;
});
