# Architecture

## Active scope and modules

Phase 00 established the Next.js foundation. Phase 01 adds PostgreSQL and
authentication. The Phase 04 audit installed missing dependencies, provisioned local
PostgreSQL 17.11, applied the initial migration to development and test databases,
and verified all nine existing database tests with no Prisma schema drift.
Phase 04 deterministic adaptation and Phase 05 local Ollama AI are authorized;
cloud AI and LMS imports are not.
The actual checkout lacks Phase 02 delivery/progress and Phase 03 assessment code.
See VERIFICATION.md for current results and ADAPTIVE_ENGINE.md for the unimplemented
adaptive contract. This is not a production-ready release.

## Phase 05 local AI

`src/server/ai` defines a typed server-only provider implemented with Ollama's
native local API. It supports chat, streaming, explanations, summarization,
validated structured output and model availability. Configuration accepts only
literal loopback addresses and the evaluated qwen3:1.7b model; redirects/cloud tags
are rejected. There is no cloud fallback or new AI SDK dependency.

Authenticated `/api/local-ai/status`, `/api/local-ai/tutor` and
`/api/local-ai/practice-drafts` routes enforce current roles, origin checks on
mutations, strict input schemas, bounded bodies, per-user quotas and one inference
per process. Retrieval scopes lesson queries to published enrolled student courses
or the current teacher's ownership. It reads at most three mapped concept notes;
the schema still has no lesson body, assessment result or mastery state. AI services
do not write learning records. No database migrations were needed for this phase.

Student/teacher dashboard links lead to separate tutor/draft views. Tutor responses
stream as plain text with bounded page-session history, cancellation, retry and
honest missing-context states. Source names come from authorized database records.
Teacher questions are schema/semantic-validated ephemeral review drafts and are
never published. The lesson player, review/publish workflow and adaptive-personalized
explanations remain blocked by absent Phases 02–04. Notes/model output are untrusted;
the model has no tools, network actions, authorization authority or grading writes.
Prompt adherence and educational accuracy are not guaranteed by these boundaries.

Ollama runs as a local CPU process with cloud features disabled, one loaded model
and a 4096-token context. In-memory quotas/concurrency are appropriate only for this
single-instance setup. See LOCAL_AI.md for hardware, setup, limits and licenses;
VERIFICATION.md distinguishes mocked transport tests from actual inference evidence.

Application routes remain in src/app. Shared UI and layout stay in src/components.
The landing feature remains public. src/features/auth contains forms, the client,
validation, and pure authorization policies. src/features/dashboard contains shell
presentation. src/server/auth verifies real sessions; src/server/services scopes
database operations; src/server/db.ts reuses a PostgreSQL/Prisma client. Every server
module imports server-only. Generated Prisma code lives in ignored
src/generated/prisma. Schema, migrations, and seeds live in prisma/.

Server Components remain the default. Only interactive forms/buttons are client
components. The client auth module imports server configuration as an erased type
for inference, never as a runtime dependency. Route handlers are thin input/origin
boundaries. Service methods require the authenticated user independently of layout
checks; services never accept caller-supplied authorization identities.

## Versions and compatibility

Use Next.js/eslint-config-next 16.4.1, React 19.2.8, TypeScript 5.9.3, and Tailwind 4.3.2. Use
Prisma/client/adapter-pg 7.9.0, pg 8.20.0, and Better Auth 1.7.7. Node >=22.12 and
ESM are used. Prisma 7 uses a driver adapter, explicit generated output, and
prisma.config.ts. CLI configuration loads .env.local; generation does not require
a live database or dummy secret.

The Better Auth v1.7.7 source tag exists and declares compatible Next ^16,
React ^19, and Prisma ^7 peers. Its official Next guide covers Next 16. This
establishes declared compatibility, not runtime success. The user authorized a
maintained compatible authentication library; Better Auth replaces the previously
researched Auth.js beta decision.

Dependencies are installed and both root/test lockfiles now reflect real installs.
Vitest is pinned to 4.1.11 and Playwright to 1.61.1. Compatible Next.js/Vitest updates
addressed reported critical vulnerabilities; compatible transitive updates were
applied without force or peer-conflict bypasses. Twelve root audit findings remain
(eleven high, one moderate); the test package audit is clear. Runtime-only audit
still reports seven findings through Prisma's dependency graph. Do not interpret
successful tests as a clean dependency security audit.

Sources:
- [Tagged Better Auth package](https://github.com/better-auth/better-auth/blob/v1.7.7/packages/better-auth/package.json)
- [Next integration](https://better-auth.com/docs/integrations/next)
- [Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Prisma 7 config](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference)

## Authentication and authorization

Better Auth owns salted scrypt password hashing, Account credential records,
database-backed sessions, cookies, expiration, and logout revocation. There is no
homemade or fake production authentication. Require a real secret; missing
configuration fails closed. Sessions expire after seven days and refresh daily;
cookie caching is disabled. Protected operations re-read the current User role.

Role is a server-owned field with input:false. Public accountType is a separate
STUDENT/TEACHER enum. A create hook assigns the validated initial role. Strict signup
validation rejects role, userId, emailVerified, and arbitrary extra fields. Update
hooks reject role/type changes. Only signup, signin, signout, and session endpoints
are exposed. No public administrator signup or role management exists.

Private profiles are strictly owner-only, including for admins. Teachers manage
only owned courses; ADMIN course management is explicit. Students can read only
published enrolled courses. Enrollment never accepts a studentId, writes only for
the current student, is idempotent, and checks availability in a serializable
transaction. Unique pairs prevent duplicates; transaction conflicts return 409.
Roster access is owner/admin-only and exposes names/IDs rather than private profiles.

Better Auth trusted-origin protections remain enabled. Application mutations require
an exact configured Origin. Sensitive JSON uses private/no-store and sanitized
errors. Auth rate limits use database storage, including five signin/signup attempts
per minute. Deployment needs trusted-proxy/client-IP configuration; do not trust
arbitrary forwarded headers without an upstream policy.

HTTPS production uses Secure, HttpOnly, SameSite=Lax cookies. Development may use
HTTP; production-build tests have an explicit localhost-only HTTP opt-in. Public
production readiness still needs email verification and recovery, which are not
implemented. emailVerified remains false. Teacher signup is an account choice,
not certification of educator identity or access to others' resources.

Sources: [server-owned fields/hooks](https://better-auth.com/docs/concepts/database),
[password storage](https://better-auth.com/docs/authentication/email-password),
[rate limits](https://better-auth.com/docs/concepts/rate-limit).

## PostgreSQL structure

User has a one-to-one Profile and STUDENT/TEACHER/ADMIN role. Course belongs to an
owner; Enrollment connects students and courses. Course contains ordered Modules;
Module contains ordered Lessons. LessonConcept maps Lessons to reusable Concepts.
Stable concept IDs support future quiz/mastery references without implementing
those features. Account, Session, Verification, and RateLimit support the library.
Passwords and tokens never appear in resource responses.

UUIDs, timestamps, foreign keys, compound uniqueness, and indexes enforce
relationships. Custom SQL checks positive ordering and normalized email. A trigger
atomically creates each Profile. Further triggers enforce teacher/admin ownership,
student-only enrollment, and role changes that preserve those relationships.
Course owners and mapped concepts use restrictive deletion; course structure and
enrollment records cascade. Custom checks/triggers live in migration history.

The manually authored initial migration was applied to local coolearn_dev and
coolearn_test databases during the Phase 04 audit. Migration status is current and
Prisma migrate diff reports no difference from the schema. Nine real PostgreSQL
relationship tests pass, including triggers, uniqueness, foreign keys, and cascades.
Do not edit this applied migration or replace migration history with db push.

## UI, tests, and later boundaries

Preserve Tailwind CSS-first tokens and locally owned shadcn Base UI primitives,
accessible labels, responsive forms, focus/pending/error states, and the public
landing page. Dashboard shells display real account identity while upcoming
learning features remain clearly labeled.

Thirteen dependency-free Node policy tests, five Vitest unit tests, lint, TypeScript,
and the production build pass. Auth reads request headers before initializing its
runtime configuration, preventing prerendering from requiring secrets. Regression
tests cover that ordering, missing sessions, and current database roles. Vitest and
Playwright remain in the separate test package. Relationship and auth browser tests use
a dedicated local PostgreSQL database ending in _test, never another technology
or a fake auth provider. See SETUP.md and VERIFICATION.md for safeguards/results.

Cloud AI and classroom integrations remain outside this phase. Local AI never
falls back to an external provider. Imported materials, if authorized in a future
phase, must retain ownership boundaries and be treated as untrusted input.
