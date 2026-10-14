# Development roadmap

The user's phase numbering is authoritative: Phase 00 is the completed foundation;
Phase 01 is database/authentication. Phase 02 is now authorized, with the user's
explicit prerequisite that essential Phase 01 functionality be verified and repaired first.

| Phase | Scope | Status |
| --- | --- | --- |
| 00 — Foundation | Next.js, TypeScript, Tailwind, shadcn/ui, landing, architecture/docs/testing scaffold | Delivered; historical verification in VERIFICATION.md |
| 01 — Database and authentication | Domain models, PostgreSQL/Prisma migration/seeds, credentials, sessions, roles/ownership, dashboard shells | Source written; lint and 13 policy tests pass; dependency install and live verification blocked |
| 02 — Learning resources | Course management/publishing, ordered modules/lessons, lecture player/resources, persisted resume and explicit completion | Authorized; implementation blocked by unmet Phase 01 prerequisites confirmed during preflight |
| 03 — Assessment and mastery | Quizzes, feedback, concept mastery | Not authorized |
| 04 — Recommendations and AI | Deterministic recommendations, evaluated OpenAI assistance | Not authorized |
| 05 — Education integrations | Authorized Classroom and Teams imports | Not authorized |
| 06 — Pilot and operations | Accessibility, verification/recovery, deployment, monitoring, feedback | Not authorized |

Before calling Phase 01 verified, install dependencies and synchronize lockfiles,
validate/generate Prisma, apply the checked-in migration on PostgreSQL, and run the
guarded development seed. Run typecheck/build and live database/authentication tests
against the dedicated test database. Fix failures and record exact outcomes.

Public production readiness also needs an email ownership/recovery policy and
trusted-proxy configuration. These documented limitations are not permission to
skip prerequisite verification. Phase 02 has not been implemented. After resolving
Phase 01 checks, reuse the existing schema, services, authentication, and UI rather
than replacing them. Stop and wait for explicit approval before Phase 03.
