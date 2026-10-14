# Coolearn

Foundation for an AI-powered adaptive learning platform. Phase 00 is the public
landing page. Phase 01 adds PostgreSQL, Prisma, email/password authentication,
server authorization, and student/teacher dashboard shells. Learning delivery,
quizzes, mastery, AI, and external integrations are not implemented.

**Current verification limit:** this sandbox cannot download new dependencies or
run PostgreSQL. Phase 01 source is written but live authentication and migrations
are unverified. Run `npm.cmd install` on a network-enabled machine to update the
root lockfile before using `npm.cmd ci`. See [verification](docs/VERIFICATION.md).

## Run locally

Requires Node.js >=22.12.0 and npm. From this directory:

```powershell
npm.cmd install
npm.cmd run db:generate
npm.cmd run dev
```

Open http://localhost:3000. On platforms where npm is available directly, use `npm`
instead of `npm.cmd`. Follow [PostgreSQL and account setup](docs/SETUP.md) to create
.env.local, start the database, apply migrations, and optionally add seed users.
The homepage remains public. Authentication requires PostgreSQL and a real secret;
there is no mock or fallback authentication.

## Checks and production

```powershell
npm.cmd run check
npm.cmd run test:policies
npm.cmd run build
npm.cmd run start
```

With the dev or production server running, `npm.cmd run smoke` checks the homepage,
compiled CSS, expected section links, development disclosure, and 404 response.
This uses Node.js and needs no test-runner downloads. It does not replace browser tests.

## Test tooling

Test dependencies are separately installed so the app does not depend on browser
downloads. With npm network access:

```powershell
npm.cmd run test:install
npm.cmd test
npm.cmd --prefix tests run browsers:install
npm.cmd run test:e2e
```

Thirteen Node.js policy tests run without extra packages. Vitest covers utility
behavior and real PostgreSQL relationships. Playwright covers landing behavior and,
with RUN_AUTH_E2E=true, real signup/login/logout, session expiry, roles, private
profiles, enrollment boundaries, and cross-origin requests. Use a separate migrated
local database ending in _test for database/browser auth tests. See docs/SETUP.md.
Do not claim these passed unless they actually ran. See docs/VERIFICATION.md.

## Project documentation

- [Product vision and future MVP](docs/PRODUCT.md)
- [Architecture and dependency decisions](docs/ARCHITECTURE.md)
- [Roadmap and approval boundaries](docs/ROADMAP.md)
- [Verification results](docs/VERIFICATION.md)
- [Project coding rules](AGENTS.md)
- [PostgreSQL, authentication, and test setup](docs/SETUP.md)
- [Phase 01 implementation and file inventory](docs/PHASE01.md)

Next.js was initialized manually following the official App Router installation
because create-next-app encounters an OS user lookup error in this restricted
Windows environment. The app remains a standard Next.js project. Root dependencies
were installed from a writable copy of the machine's npm cache; the cache is an
environment workaround outside this project and is unnecessary for normal setup.
