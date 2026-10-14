# Development roadmap

Each phase requires explicit user approval before implementation. Descriptions
below are planning, not authorization. Only Phase 1 is currently authorized.

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 1 — Foundation | Next.js, TypeScript, Tailwind, shadcn/ui setup, modular folders, public landing page, docs, environment template, testing scaffold | Installable app, clean lint/type checks, production build and HTTP checks; browser/unit tests run or blockers clearly documented |
| 2 — Identity and persistence | Approve student data model; PostgreSQL/Prisma setup and migrations; published Auth.js compatibility check; student accounts and secure sessions | Sign-in/sign-out, session expiry, ownership enforcement, migration and auth tests |
| 3 — Learning resources | Courses, lecture and reading resources, progress records, resume/completion behavior | Authorized resource access and durable progress tested end-to-end |
| 4 — Assessments and mastery | Concept taxonomy, quizzes, attempt scoring, feedback, evidence-based mastery | Scoring and mastery rules documented and tested; reliable student overview |
| 5 — Recommendations and AI | Deterministic next-step engine, explanation of recommendations, evaluated OpenAI assistance | Baseline evaluation, useful recommendations, provider error handling, privacy and cost controls |
| 6 — Education integrations | Authorized Google Classroom and Microsoft Teams for Education imports | Verified official APIs, approved scopes, consent/revocation, import deduplication and failure recovery |
| 7 — Pilot and operations | Student feedback, accessibility review, deployment, monitoring and reliability | Pilot readiness and operational runbook reviewed |

## Next proposed phase

Phase 2: agree on student/account ownership and the first persistence model, then
verify the published Auth.js and Prisma versions before installing them. Design
and implement authentication and the database only after approval. Do not move
into resource delivery, quizzes, or AI as part of Phase 2.

## Outstanding foundation verification

See docs/VERIFICATION.md for actual commands, results, and environment restrictions.
Resolve outstanding foundation checks before considering Phase 1 fully verified.
