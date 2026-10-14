# Release checklist

Phase 04 release is **BLOCKED**. The dependency/database foundation has been repaired,
but this checkout lacks Phase 02 learning delivery, Phase 03 assessment, and Phase 04
adaptation implementations. See VERIFICATION.md for executed checks and their limits.

## Foundation

- [x] Install real pinned dependencies and synchronize both lockfiles.
- [x] Generate and validate Prisma client/schema.
- [x] Apply initial migration to isolated local development/test PostgreSQL databases.
- [x] Verify migration status and no schema drift.
- [x] Pass lint, strict TypeScript, policy tests, unit tests, and database tests.
- [x] Fix auth initialization during prerendering and complete a production build.
- [x] Install Chromium for actual browser verification.
- [x] Verify existing auth/authorization and public UI in Chromium desktop/mobile
  (27 passed; one mobile-only test intentionally skipped on desktop).
- [ ] Resolve remaining dependency audit findings (12 root; 7 with dev omitted).
- [ ] Establish email verification/recovery and trusted-proxy policy for production.
- [ ] Provision production PostgreSQL, secret management, HTTPS, backups, restore
  verification, monitoring, and a deployment/migration rollback strategy.

## Learning and assessment prerequisites

- [ ] Locate completed Phase 02/03 code or establish their missing implementation scope.
- [ ] Verify teacher course/module/lesson/resource authoring and publication UI.
- [ ] Verify real lesson playback, unavailable media handling, resume/completion,
  persisted progress, and cross-student progress isolation.
- [ ] Verify concept-tagged question authoring and published quizzes.
- [ ] Verify server grading, private answer keys, immutable result evidence,
  duplicate/simultaneous submission handling, and attempt policies.

## Adaptive learning

- [ ] Implement/migrate LearnerConceptState and immutable evidence/event receipts.
- [ ] Implement versioned, replayable mastery heuristic and edge-case coverage.
- [ ] Implement prerequisite graph constraints and deterministic recommendations.
- [ ] Integrate exactly-once assessment processing with safe transactional retry.
- [ ] Build the dashboard using actual data and meaningful insufficient-evidence states.
- [ ] Verify improvement, revision, prerequisite order, unavailable resources, and
  learner isolation in real Chromium workflows.
- [ ] Test network/API failures and partial transaction failures.
- [ ] Complete keyboard, responsive, reduced-motion, and accessibility review.

Phase 05 local Ollama AI is now authorized and partially implemented; see LOCAL_AI.md.
Full release remains blocked on the missing learning/assessment/adaptive workflows.
Classroom/Teams and cloud AI fallback remain excluded.
