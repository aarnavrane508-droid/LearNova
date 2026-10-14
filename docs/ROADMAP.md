# Development roadmap

## Current Phase 05 — local AI

The current request authorizes local Ollama/Qwen3 integration only, with no paid
cloud API or automatic cloud fallback. Independent provider, authenticated
concept-note tutoring and ephemeral teacher draft generation are implemented.
The source still lacks the lesson player/progress, assessments and adaptive engine;
this does not complete those earlier phases or their required integration flows.
See LOCAL_AI.md and the newest VERIFICATION.md entry for actual test evidence.

Remaining work: complete/restore Phases 02–04, embed tutoring inside the real lesson
experience, feed authorized mastery/recommendation context, implement feedback
permission checks, and persist reviewed drafts through a teacher-approved assessment
publication flow. No Classroom/Teams integration is authorized. Earlier request
and approval descriptions below are historical.

## Current Phase 04 audit

The current request authorizes deterministic concept mastery and recommendations,
with verification of earlier phases first. AI tutoring and Classroom/Teams remain
excluded. Earlier approval/status statements below are historical.

The audit found Phase 01 source only: course metadata/enrollment APIs, basic
module/lesson/concept schema, and account dashboard shells. Phase 02 delivery,
resources and progress, and Phase 03 quizzes/results are absent. No assessment
events exist for adaptive processing. A source-location/scope clarification is
pending for these missing prerequisites; Phase 04 is not implemented.

Dependency installation is now resolved. PostgreSQL 17.11 runs locally; the initial
migration is applied to development/test databases, with no schema drift and nine
passing relationship tests. The auth prerendering defect was fixed, critical
Next.js/Vitest dependency findings addressed, and both lockfiles synchronized.
See VERIFICATION.md for full results and outstanding release blockers.

Remaining implementation order: establish the missing Phase 02 source, establish
Phase 03 server grading and immutable concept evidence, then integrate the Phase 04
contract in ADAPTIVE_ENGINE.md and verify workflows A-E. Do not begin AI/integrations.

## Phase 03 request — 2026-10-15

Phase 03 quiz and assessment implementation is now explicitly authorized. This
authorization excludes mastery scoring, adaptive recommendations, AI tutoring,
and external integrations. Phase 04 remains unapproved.

The required preflight is blocked: neither the current checkout nor fetched
`origin/main` contains Phase 02 course authoring, lecture playback, resources, or
persisted learning progress. Phase 01 runtime dependencies, generated client, and
local environment configuration are absent; local PostgreSQL is unreachable.
The historical phase table below records the earlier state, not current approval.

Before assessment implementation, locate the completed Phase 02 branch or obtain
a scope change to finish the missing prerequisites. The current request expressly
limits implementation to Phase 03, so missing Phase 02 features were not created.

Planned assessment work after the prerequisite gate:

1. Add course/optional lesson quizzes, concept-mapped questions/options, difficulty,
   attempts, answer snapshots, constraints, indexes, and PostgreSQL migrations.
2. Reuse session and ownership services for teacher authoring/publication and
   student enrollment checks. Freeze attempted content or create new revisions.
3. Grade on the server using exact-match single/multiple-choice scoring (no partial
   credit); save concept evidence without claiming mastery. Serialize attempt
   limits and submission, and make duplicate submission idempotent.
4. Add accessible quiz navigation, answer saving, policy-filtered results, and
   owner-only attempt history. Keep answer keys out of active-attempt responses.
5. Verify permissions, grading, concurrency, snapshots, confidentiality, migrations,
   and browser flows before calling Phase 03 complete.

The user's phase numbering is authoritative: Phase 00 is the completed foundation;
Phase 01 is database/authentication. Phase 02 is now authorized, with the user's
explicit prerequisite that essential Phase 01 functionality be verified and repaired first.

| Phase | Scope | Status |
| --- | --- | --- |
| 00 — Foundation | Next.js, TypeScript, Tailwind, shadcn/ui, landing, architecture/docs/testing scaffold | Delivered; historical verification in VERIFICATION.md |
| 01 — Database and authentication | Domain models, PostgreSQL/Prisma migration/seeds, credentials, sessions, roles/ownership, dashboard shells | Source written; lint and 13 policy tests pass; dependency install and live verification blocked |
| 02 — Learning resources | Course management/publishing, ordered modules/lessons, lecture player/resources, persisted resume and explicit completion | Authorized; prerequisite recheck still finds missing packages/configuration/database. Local setup helper prepared; features not started |
| 03 — Quiz and assessment engine | Concept-based quizzes, deterministic grading, feedback, attempt history; no mastery or AI | Authorized; blocked on missing Phase 02 implementation and unverified Phase 01 runtime |
| 04 — Adaptive learning | Deterministic concept mastery, recommendations, personalized dashboard; no AI | Authorized by the current request; blocked on missing prerequisite implementations |
| 05 — Fully local AI | Ollama/Qwen3 provider, grounded tutor, teacher practice drafts, adaptive explanations | Authorized; partial integration, missing learning/assessment/adaptive prerequisites |
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
