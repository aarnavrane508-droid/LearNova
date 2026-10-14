# Coolearn

Foundation for an AI-powered adaptive learning platform. Phase 1 includes a public
landing page and project structure; learning features are planned and not implemented.

## Run locally

Requires Node.js >=22.12.0 and npm. From this directory:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. On platforms where npm is available directly, use `npm`
instead of `npm.cmd`. No database, API key, or .env file is required for this phase.
Copy .env.example to .env.local only when configuring later features.

## Checks and production

```powershell
npm.cmd run check
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

Unit tests cover class composition; Playwright covers landing navigation,
development status, unknown routes, mobile navigation, layout overflow, and browser
errors. Tests start a production server at http://127.0.0.1:3100 automatically.
Do not claim these passed unless they actually ran. See docs/VERIFICATION.md.

## Project documentation

- [Product vision and future MVP](docs/PRODUCT.md)
- [Architecture and dependency decisions](docs/ARCHITECTURE.md)
- [Roadmap and approval boundaries](docs/ROADMAP.md)
- [Verification results](docs/VERIFICATION.md)
- [Project coding rules](AGENTS.md)

Next.js was initialized manually following the official App Router installation
because create-next-app encounters an OS user lookup error in this restricted
Windows environment. The app remains a standard Next.js project. Root dependencies
were installed from a writable copy of the machine's npm cache; the cache is an
environment workaround outside this project and is unnecessary for normal setup.
