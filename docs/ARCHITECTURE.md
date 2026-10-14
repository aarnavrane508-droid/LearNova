# Architecture

## Active scope and modules

Phase 00 established the Next.js foundation. Phase 01 adds PostgreSQL and
authentication source. Live verification is blocked; this is not a production-ready
release. Phase 02 course/player/progress work is authorized, but the user requires
essential Phase 01 verification first. Quizzes, mastery, AI, and LMS imports remain
outside the authorized scope.

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

Retain Next.js 16.2.10, React 19.2.8, TypeScript 5.9.3, and Tailwind 4.3.2. Add
Prisma/client/adapter-pg 7.9.0, pg 8.20.0, and Better Auth 1.7.7. Node >=22.12 and
ESM are used. Prisma 7 uses a driver adapter, explicit generated output, and
prisma.config.ts. CLI configuration loads .env.local; generation does not require
a live database or dummy secret.

The Better Auth v1.7.7 source tag exists and declares compatible Next ^16,
React ^19, and Prisma ^7 peers. Its official Next guide covers Next 16. This
establishes declared compatibility, not runtime success. The user authorized a
maintained compatible authentication library; Better Auth replaces the previously
researched Auth.js beta decision.

New packages cannot be downloaded in this sandbox. Root package-lock.json still
records Phase 00. Successful npm install must synchronize it before npm ci. Do not
bypass peer conflicts or fabricate package/type declarations to make checks pass.

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

The initial migration is manually authored and has not been executed or schema-diff
validated. Validate it on PostgreSQL before relying on it. Do not edit an applied
migration or use db push as a replacement for migration history.

## UI, tests, and later boundaries

Preserve Tailwind CSS-first tokens and locally owned shadcn Base UI primitives,
accessible labels, responsive forms, focus/pending/error states, and the public
landing page. Dashboard shells display real account identity while upcoming
learning features remain clearly labeled.

Thirteen dependency-free Node policy tests and lint can run with existing tooling.
Typecheck/build need new packages and client generation. Vitest and Playwright
remain in the separate test package. Real relationship and auth browser tests use
a dedicated local PostgreSQL database ending in _test, never another technology
or a fake auth provider. See SETUP.md and VERIFICATION.md for safeguards/results.

Future OpenAI and classroom services remain server-side adapters with consent,
ownership, evaluated output, and cost controls. None is implemented in Phase 01.
