# Phase 01 implementation report

Source for database and authentication has been added. This phase is not fully
verified: new dependencies cannot be installed and PostgreSQL is unavailable in
the current sandbox. Do not consider the account flows production-ready until the
checks in SETUP.md succeed. No Phase 02 work or GitHub push was performed.

## Database schema

| Model | Purpose and constraints |
| --- | --- |
| User | Unique normalized email; server-owned STUDENT/TEACHER/ADMIN role; public signup intent stored separately; UUID and timestamps |
| Profile | One per user, unique userId; bio/timezone; atomic user-create trigger; cascade on user deletion |
| Course | Teacher/admin owner; unique slug; DRAFT/PUBLISHED/ARCHIVED status; owner/status indexes; restrictive owner deletion |
| Enrollment | Student-course join; unique pair; enrollment timestamp; course lookup index; student-only trigger |
| Module | Belongs to a course; positive position unique within that course; cascade |
| Lesson | Belongs to a module; positive position unique within that module; reading/video kind; cascade |
| Concept | Reusable concept identity with unique slug; future quiz/mastery references can use this ID |
| LessonConcept | Many-to-many lesson/concept mapping; composite primary key and reverse concept index; timestamps |
| Account | Better Auth credentials and optional provider metadata; password hash never exposed through resource APIs |
| Session | Unique private token, expiry, user relation, timestamps, lookup/expiry indexes |
| Verification | Library support schema for future verification; no email workflow implemented |
| RateLimit | Database-backed authentication throttle storage |

The migration includes all tables, foreign keys, indexes, positive-position and
normalized-email checks, profile provisioning, role invariants, and restrictive/
cascading deletion decisions. The SQL is manually authored, not generated or
executed successfully here. Prisma validation and live schema/migration review
remain required. Development seeds are idempotent and guarded to a local _dev
database with an explicit flag and caller-supplied password; no admin is seeded.

## Authentication and permissions

Better Auth provides email/password authentication, scrypt hashes, real revocable
database sessions, seven-day expiry, and logout. Public registration accepts only
STUDENT/TEACHER account types. Role is non-input/server-owned; a validated signup
hook assigns the initial role. Public ADMIN registration and role changes are
blocked. Current roles are re-read from PostgreSQL for authorization.

Student and teacher routes have protected dashboard shells; an admin shell supports
trusted provisioned administrators. Every page/API/service checks the real session.
Private profiles are owner-only. Teachers cannot read rosters or modify courses
owned by another teacher. Only students may enroll, and only as themselves in a
published course. Duplicate enrollment is idempotent and constrained in PostgreSQL.
Course metadata management services are present; lesson delivery, publication UI,
quiz/mastery tracking, AI, and LMS imports remain future work.

Origin validation, private/no-store JSON, generic resource errors, signup/signin
rate limits, secure HTTPS cookies, and no client database/secret imports are part
of the source. Missing infrastructure fails closed; no fake production auth exists.
Email verification/recovery and deployment proxy policy are outstanding production
readiness decisions. Teacher account choice is not educator certification.

## Actual checks

- Passed: ESLint with zero warnings; 13 Node authorization tests, zero failures or
  skips; git diff whitespace checks; HTTP smoke against the existing public server
  (homepage/CSS 200, unknown route 404, expected content/anchors present).
- Failed: npm install (EACCES/outbound restriction), test tooling installation
  (Vitest ENOTCACHED), and typecheck (missing new packages/generated client).
- Blocked: Prisma validation/generation, applying migrations, seeding, production
  build, Vitest utility/database tests, Playwright authentication/landing tests.
- PostgreSQL: no psql/docker executable/service/installation found; local port 5432
  returns ECONNREFUSED. No other database was substituted.
- Lockfiles: root lockfile is intentionally preserved at Phase 00 until a real
  successful install updates it; test lockfile is absent. No hand-invented lock entries.

See VERIFICATION.md for exact commands/results and SETUP.md for local completion.

## Files modified

- .env.example
- .gitignore
- AGENTS.md
- README.md
- docs/ARCHITECTURE.md
- docs/PRODUCT.md
- docs/ROADMAP.md
- docs/VERIFICATION.md
- package.json
- src/components/layout/site-header.tsx
- tests/package.json
- tests/playwright.config.ts
- tsconfig.json

## Files created

- compose.yaml
- docs/PHASE01.md
- docs/SETUP.md
- prisma.config.ts
- prisma/schema.prisma
- prisma/seed.ts
- prisma/migrations/migration_lock.toml
- prisma/migrations/20261014173000_identity_and_learning_structure/migration.sql
- scripts/prepare-test-db.mjs
- src/app/api/auth/[...all]/route.ts
- src/app/api/courses/route.ts
- src/app/api/courses/[courseId]/route.ts
- src/app/api/courses/[courseId]/enrollments/route.ts
- src/app/api/profile/route.ts
- src/app/api/profiles/[userId]/route.ts
- src/app/dashboard/layout.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/error.tsx
- src/app/dashboard/student/page.tsx
- src/app/dashboard/teacher/page.tsx
- src/app/dashboard/admin/page.tsx
- src/app/error.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/components/ui/input.tsx
- src/features/auth/client.ts
- src/features/auth/policy.ts
- src/features/auth/validation.ts
- src/features/auth/components/auth-form.tsx
- src/features/auth/components/auth-page.tsx
- src/features/auth/components/logout-button.tsx
- src/features/dashboard/components/dashboard-shell.tsx
- src/server/db.ts
- src/server/http.ts
- src/server/auth/auth.ts
- src/server/auth/session.ts
- src/server/services/courses.ts
- src/server/services/profile.ts
- tests/policies/authorization.test.ts
- tests/integration/relationships.db.test.ts
- tests/e2e/auth.spec.ts
- tests/vitest.database.config.ts
