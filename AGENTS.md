# Coolearn project rules

## Scope and approval

The active phase is Phase 1: foundation only. Do not implement authentication,
database models, lectures, quizzes, mastery scoring, AI, or integrations until the
user explicitly approves the corresponding phase. Documentation of future work
is allowed. Do not interpret roadmap items as authorization to implement them.

## Before editing

- Read existing files and docs/PRODUCT.md, docs/ARCHITECTURE.md, and docs/ROADMAP.md.
- Preserve user changes. Never delete or overwrite unrelated files.
- Verify dependency releases, peer dependencies, and APIs against official docs.
- Read relevant bundled Next.js documentation in node_modules/next/dist/docs
  before framework changes, when available. This repository uses Next.js 16.
- Never bypass peer conflicts with --force or --legacy-peer-deps.

## Architecture and code

- Use strict TypeScript; avoid any and unjustified type assertions.
- Keep src/app focused on routes, layouts, metadata, and route composition.
- Put domain code in src/features/<feature>; shared UI in src/components/ui;
  shared layout in src/components/layout; utilities in src/lib; settings in src/config.
- Prefer Server Components. Add use client only for browser state or client primitives.
- Future server services belong in src/server and must be marked server-only.
  Never import database clients, provider tokens, or AI secrets into client components.
- Use @/* aliases, named component exports, descriptive names, and small modules.
- Use locally owned shadcn/ui primitives and Tailwind theme tokens. Extend existing
  primitives before adding a competing UI system.
- Use semantic links for navigation, buttons for actions, accessible labels and
  focus states, reduced-motion support, and responsive layouts.
- Label illustrative content and planned features honestly. No fake testimonials,
  metrics, working-looking login buttons, or claims about unimplemented features.

## Data and external services (future phases)

- PostgreSQL is the planned durable store; Prisma is the planned ORM.
- Define schemas and migrations only in the approved persistence phase.
- Validate input at server boundaries; enforce resource ownership server-side.
- Keep secrets out of NEXT_PUBLIC_* variables, source code, logs, and browser bundles.
- Import classroom resources only with explicit authorization and minimum scopes.
- Keep mastery logic explainable and testable; do not equate quiz scores with
  proven mastery or delegate authorization decisions to model output.

## Verification and reporting

- Use npm and preserve package-lock.json. Runtime dependency versions are pinned.
- On this Windows machine, use npm.cmd if npm.ps1 is blocked.
- Run npm run check and npm run build for source/configuration changes.
- Install the separate testing harness with npm run test:install; run npm test
  for utility/domain behavior and npm run test:e2e for browser flows when available.
- Keep unit tests in tests/unit and browser tests in tests/e2e. Test observable
  behavior and meaningful failure cases; avoid tests that only mirror markup.
- Report commands run, failures, skipped checks, and incomplete work truthfully.
- Update documentation when architecture or scope changes. Stop after the active
  phase; propose the next phase without starting it.
