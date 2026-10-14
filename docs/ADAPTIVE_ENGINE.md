# Adaptive learning engine

## Implementation status

Phase 04 is authorized by the current request, but **not implemented**. The actual
checkout has no quiz, question, answer, attempt, result, learner-progress, or
LearnerConceptState models. There is no committed assessment event to consume.
Course metadata and enrollment services exist; lesson delivery and assessment
workflows do not. The student dashboard is an account shell.

The following is a proposed implementation contract, not a description of working
features. Restore the completed Phase 02/03 source or explicitly establish their
implementation scope before integrating Phase 04. No AI or external integration
is part of this phase.

## Proposed evidence and mastery contract

- Persist immutable, server-graded observations with student, course, concept,
  attempt, question revision, correctness, difficulty, and assessment timestamp.
- Enforce uniqueness per attempt/question/concept, plus an assessment-event receipt.
  Tie each state and receipt to the authenticated student's enrollment.
- Store estimated mastery, valid observation count, recent performance, last
  assessed/reviewed times, next review date, and the model version.
- A lesson review may update lastReviewedAt; video time must never raise mastery.
- Recalculate from persisted evidence in timestamp/ID order with an explicit as-of
  timestamp. Never use an implicit wall clock in the pure model.

Proposed v1 heuristic (requires implementation and calibration tests): begin with
a neutral prior of four effective observations at 50%. For each distinct question
revision, retain its most recent valid evidence as of the calculation timestamp;
repeated identical submissions do not add independent weight. A correct answer has
target 1 and an incorrect answer target 0. Difficulty weights are 0.75 for easy,
1 for medium, and 1.25 for hard. Recency weight is
`2 ** (-ageInDays / 60)`. Multiply difficulty and recency weights to obtain `w`.

`mastery = 100 * (2 + sum(w * correctness)) / (4 + sum(w))`

Round only the displayed value. The estimate is bounded by 0 and 100. With no
evidence, present an insufficient-evidence state rather than displaying the neutral
prior as measured knowledge. One fresh hard answer shifts the neutral estimate by
at most about 11.91 points. Older evidence contributes less and gradually returns
the estimate toward the prior; this is an explicit heuristic, not measured forgetting.
The observation count should report independent question revisions contributing
to the estimate, with raw event counts available separately for auditability.

This formula is a proposal, has not been coded or validated, and is not a validated
psychological measurement. Thresholds, repetition windows across question revisions,
and review intervals need documented tests before activation.

## Proposed recommendation rules

1. Filter to published, enrolled courses and existing accessible resources.
2. Traverse prerequisite concepts in topological order. Reject cycles at the write
   boundary and serialize concurrent graph edits so two individually valid edits
   cannot introduce a cycle together.
3. Prefer review of weak prerequisites before dependent practice.
4. Recommend a mapped lesson or a published quiz with matching questions only when
   it actually exists. Otherwise explain that no targeted activity is available.
5. With sufficient evidence and no urgent gap, continue to the next incomplete
   lesson; include due revision suggestions for previously assessed concepts.
6. Resolve equal priorities with stable IDs for deterministic results.

Each result must include the authenticated student ID, concept ID, action type,
optional real lesson/quiz ID, priority, explanation, evidence summary, and model
version. Return no invented resource IDs and no other learner's private data.

## Proposed submission transaction and verification gate

Commit grading, immutable evidence, an idempotency receipt, and affected mastery
states atomically, or commit an outbox event with grading and process it using a
unique event receipt. Concurrent attempts must serialize updates per learner/course;
retry transaction conflicts without creating a second result or receipt. Refresh
recommendations from committed state and recheck resource access on read.

Required tests include deterministic replay, bounded scores, repeated evidence,
recency, prior strength, simultaneous and duplicate submissions, rollback/retry,
cross-student isolation, inaccessible/missing resources, prerequisite cycles,
empty accounts, and real browser improvement/review flows. None of these adaptive
tests has run because the assessment and adaptive implementations are absent.
