# Local PostgreSQL and authentication setup

## Current workspace after the Phase 04 audit

The earlier missing-package and database blockers below have been resolved in this
workspace. Root/test dependencies and Chromium are installed; both lockfiles are
synchronized. PostgreSQL 17.11 runs on 127.0.0.1:5432 with separate coolearn_dev and
coolearn_test databases, both migrated. Random credentials are stored only in ignored
.env.local. Do not print or commit that file. No development users were seeded.

Run `npm.cmd run dev` and open http://localhost:3000/register to create an account.
Only the implemented foundation/account features are available; Phase 02/03/04
learning workflows are absent. See VERIFICATION.md for test evidence.

This audit used official EDB PostgreSQL binaries rather than a Windows service.
If the machine restarts, start the existing database from the project directory:

```powershell
& .\.verification\postgres\runtime\pgsql\bin\pg_ctl.exe -D .\.verification\postgres\data -l .\.verification\postgres\server.log -o "-h 127.0.0.1 -p 5432" -w start
```

Stop it with the same executable and `-D .\.verification\postgres\data -m fast -w stop`.
Do not delete .verification/postgres/data: it contains this local database. This is
development infrastructure, not a production service or backup strategy. Other
machines should use the Docker/existing-PostgreSQL procedure below and `npm.cmd ci`
plus `npm.cmd --prefix tests ci` with the updated lockfiles.

The prior sandbox-specific failure descriptions below are historical. Approved
outside-sandbox commands worked during this audit; the sandbox execution helper
itself still failed before starting PowerShell.

## Automated local setup on Windows

Install and start [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/),
then run this in your own Windows terminal:

```powershell
& "D:\Coolearn\adaptive-learning\scripts\setup-local.cmd"
```

The helper uses the existing compose service, schema, migrations, package versions,
and test suites. It creates .env.local only if absent, with random database/auth
secrets and dedicated local _dev/_test database settings. It never overwrites an
existing environment file or prints passwords. It rejects production NODE_ENV,
remote databases, placeholders, and mismatched Docker/connection settings. No
database is dropped or reset, and no development course or user is seeded.

It starts PostgreSQL, installs root/test packages, validates/generates Prisma,
applies the current migration to development and test databases, runs lint/typecheck,
policy/unit/database tests, installs Chromium, and runs real authentication browser
tests. The existing browser configuration also builds the production application.
Any failing command stops setup; passing file checks alone are not authentication
verification. The generated files do not add Phase 02 learning features.

For your own already-running local PostgreSQL, configure .env.local as described
below and use `scripts\setup-local.cmd --existing-postgres`. The database role needs
permission to create the separate _test database; existing databases are preserved.
No SQLite or simulated auth fallback is used. Run `scripts\setup-local.cmd --check`
for read-only prerequisite file checks without downloads or changes.

This sandbox can validate helper syntax and guards, but cannot run its download/
Docker/migration/browser path. Send the actual terminal results back before treating
Phase 01 as verified and proceeding with Phase 02.

## 1. Install the dependencies

Use Node.js >=22.12 and npm, from D:\Coolearn\adaptive-learning:

```powershell
npm.cmd install
npm.cmd run test:install
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

The current sandbox cannot complete npm installation. The tracked root lockfile
still describes Phase 00; `npm install` must update it for the Phase 01 dependencies.
Review and commit the updated root lockfile and tests/package-lock.json after
successful installation. Once synchronized, use `npm ci` for repeatable installs.
No force or legacy-peer-deps flags are needed or authorized.

## 2. Set real local configuration

Edit the ignored .env.local file. Set POSTGRES_USER, POSTGRES_PASSWORD, and
POSTGRES_DB=coolearn_dev. Set DATABASE_URL to a PostgreSQL URL with the same values.
URL-encode special characters in its password. Set BETTER_AUTH_URL=http://localhost:3000.
Generate a random authentication secret locally and paste it into BETTER_AUTH_SECRET:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Keep this output private. The application requires at least 32 characters; do not
use a placeholder. No provider secret is built into the source. Production requires
an HTTPS origin and secure cookies. ALLOW_LOCAL_HTTP_AUTH is an explicit exception
for localhost production-build tests, not a deployment setting.

## 3. Start PostgreSQL

Option A: install Docker Desktop, enable its engine, then run:

```powershell
docker compose --env-file .env.local up -d postgres
docker compose --env-file .env.local ps
```

The compose file uses PostgreSQL 17 with a named volume and binds the port only to
127.0.0.1. The password is required from .env.local. Wait until the service is healthy.

Option B: install PostgreSQL locally with the official Windows installer. Create a
development user and coolearn_dev database, then point DATABASE_URL to that instance.
Do not switch to SQLite when PostgreSQL is unavailable.

Do not run `docker compose down -v` unless intentionally deleting the local database.

## 4. Apply the migration and generate the client

```powershell
npm.cmd run db:validate
npm.cmd run db:generate
npm.cmd run db:migrate
```

The checked-in migration includes tables, foreign keys, indexes, check constraints,
automatic profile provisioning, and ownership/enrollment role triggers. It was
authored manually because the Prisma CLI cannot be installed in this sandbox.
Validate it against PostgreSQL before relying on the schema. For later schema
changes, use `npm.cmd run db:migrate:dev -- --name descriptive_change`, review the SQL,
then regenerate the client. Never use db push as a replacement for migration history.

## 5. Optional development seed

In .env.local, set ALLOW_DEV_SEED=true and choose a unique SEED_PASSWORD of 12–128
characters. Then run:

```powershell
npm.cmd run db:seed
```

The seed refuses production NODE_ENV, remote hosts, and databases not ending in
_dev. It creates teacher@example.test and student@example.test with the supplied
password, hashed by Better Auth. It adds one example course, module, lesson, two
concepts/mappings, and a student enrollment. It does not create an administrator.
Seed reruns preserve existing passwords and reject unexpected user/course owners.
No credential is printed. Remove SEED_PASSWORD and disable ALLOW_DEV_SEED afterward.

## 6. Register, log in, and log out

```powershell
npm.cmd run dev
```

Visit http://localhost:3000/register, enter your name/email and a 12–128 character
password, then choose Student or Teacher. Signup establishes a real database-backed
session and redirects to the corresponding dashboard. Visit /login to sign in and
use Log out to revoke the current session. /dashboard chooses the route from the
current database role. Other-role dashboards redirect to your own workspace.

Public ADMIN signup and public role changes are rejected. Administrator provisioning
is a trusted database/operations task, not a public UI. Teacher signup creates an
account type; it does not certify an educator's identity or grant access to anyone
else's courses. Email verification and password recovery are not implemented;
emailVerified remains false. Establish those flows before public production launch.

## 7. Tests

These checks require no database:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:policies
npm.cmd test
npm.cmd run build
```

Type checking/build require installed dependencies and a generated Prisma client.
The build generates the client and does not connect to the database or substitute
dummy credentials. `npm run smoke` checks an already-running HTTP server.

For live database and authentication tests, create a separate local coolearn_test
database. For the compose setup, replace coolearn with your configured username:

```powershell
docker compose --env-file .env.local exec postgres createdb -U coolearn coolearn_test
```

Set TEST_DATABASE_URL and E2E_DATABASE_URL to that same database in .env.local, using
your local credentials. Both URLs must use a local host and a database ending in
_test. The test migration helper refuses the development/production database:

```powershell
npm.cmd run db:test:prepare
npm.cmd run test:db
npm.cmd --prefix tests run browsers:install
$env:RUN_AUTH_E2E = "true"
npm.cmd run test:e2e
```

Authentication browser tests use port 3100, an ephemeral secret, local-only HTTP
cookies, and the migrated test database. They keep production rate limiting enabled
and clear rate-limit records between serial test cases in that dedicated database.
Fixture users/course records are removed after the run. No production database
should ever be used. Without RUN_AUTH_E2E=true, Playwright runs only the existing
landing tests; that does not verify authentication.

## Exact current environment blocker

No psql or docker executable is present, no PostgreSQL service was found, and a TCP
connection to 127.0.0.1:5432 failed with ECONNREFUSED. Outbound npm registry requests
fail with EACCES because CODEX_SANDBOX_NETWORK_DISABLED=1. See docs/VERIFICATION.md
for commands attempted and actual results. This phase has not been proven live.
