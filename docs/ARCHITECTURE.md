# Architecture

## Decision: a modular Next.js application

Use one Next.js App Router application with strict TypeScript. Server Components
are the default. The public homepage is statically renderable and has no dependency
on accounts, a database, an AI provider, or classroom permissions. There is no
backend API to implement in Phase 1.

```text
src/
  app/                         Route composition, metadata, global styles
  components/
    layout/                    Shared brand, navigation, footer
    ui/                        Locally owned shadcn/ui primitives
  config/                      Public application settings
  features/
    landing/
      components/              Landing sections and static illustration
      content.ts               Typed presentation content
  lib/                         Small shared utilities
tests/
  package.json                 Independently installable test tooling
  unit/                        Vitest behavior tests
  e2e/                         Playwright browser tests
docs/                          Product decisions and phase boundaries
```

Add feature folders only as their phases are approved. Future infrastructure and
provider adapters belong in src/server; Prisma schema and migrations belong in
prisma/. Neither is implemented yet. Features may consume shared UI and services;
shared primitives must not depend on domain features. Server-side imports must
never cross into client modules.

## UI and styling

Tailwind CSS 4 uses the PostCSS plugin and CSS-first theme tokens in
src/app/globals.css; a tailwind.config.js is unnecessary. components.json configures
shadcn/ui with Base UI, src aliases, and CSS variables. Button and Card are locally
owned, adapted primitives based on the official component patterns, installed
manually because the registry CLI cannot access the network in this environment.
Navigation uses semantic anchors with buttonVariants. Keep additions consistent
with the documented Base UI component setup.

System fonts avoid runtime/build dependencies on a font CDN. The landing page uses
semantic landmarks, a skip link, native mobile navigation, visible focus states,
reduced-motion support, and responsive grids. Planned functionality is labeled.

## Versions and compatibility

The environment provides Node 24.15.0. The project requires Node >=22.12.0 to leave
room for the future Prisma stack; Next.js 16 itself requires >=20.9.0. The foundation
pins Next.js 16.2.10, React/React DOM 19.2.8, TypeScript 5.9.3, and Tailwind 4.3.2,
using available real releases in the local npm cache. Do not interpret these as a
claim to use the newest releases. @types/node 20 describes the compatible API floor;
the application currently uses no Node 24-specific APIs.

Auth.js compatibility was researched on 2026-10-14, not integration-tested:

- [Official documentation](https://authjs.dev/getting-started) covers v5 beta.
- [Current official package source](https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/package.json)
  reports 5.0.0-beta.32 and declares Next ^14 || ^15 || ^16 and React ^18.2 || ^19.
- The source manifest is evidence of declared compatibility, not verification that
  that exact release has been published to npm. Registry access is restricted here.
- Before the authentication phase, verify the published next-auth release and
  peer dependencies, then deliberately choose a stable compatible release or
  review the beta tradeoff with the user. No next-auth package is installed now.
- Do not use outdated NextAuth v4 examples interchangeably with v5 APIs.

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation),
[shadcn Next.js setup](https://ui.shadcn.com/docs/installation/next),
[Base UI Button source](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/base/ui/button.tsx).

## Persistence, AI, and integration boundaries (planned)

PostgreSQL and Prisma will be introduced when the data model is approved. Validate
the current Prisma release, runtime requirements, and Auth.js adapter compatibility
then. Do not introduce placeholder models, migrations, or a database client now.

OpenAI calls will run exclusively on the server behind a provider service with
validated inputs, rate limits, timeouts, budget controls, and evaluation. Start
with deterministic learning recommendations before introducing model assistance.
Do not select a model or invent an API contract in this phase.

Google Classroom and Microsoft Teams connectors will be separate server adapters,
with explicit authorization, minimum permissions, resource ownership, and token
revocation. Their resource APIs and consent flows need verification in that phase.

## Environment and testing

.env.example lists future server variables. No variables are required to render or
build Phase 1. Real credentials stay in ignored .env.local or deployment secrets.

ESLint, TypeScript, production build, and an HTTP smoke check validate the app.
Vitest 4.0.18 and Playwright 1.61.1 are configured in a separate test package so a
test-runner download cannot block installation of the application. Run
`npm run test:install` before `npm test` or `npm run test:e2e`; install Chromium with
`npm --prefix tests run browsers:install`. Commit tests/package-lock.json after its
first successful install. Browser tests exercise a production server on port 3100
at desktop and mobile sizes. The application lockfile covers the root package;
testing dependencies have their own installation and lockfile.
