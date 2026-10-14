# Coolearn product vision

Coolearn is a planned AI-powered adaptive learning platform. Students will watch
lectures, read learning materials, practice with quizzes, and receive guidance
based on progress, concept mastery, strengths, and weaknesses. The goal is a clear,
supportive next step rather than a generic list of content.

## Audience and learning loop

The primary audience is students following structured courses. The intended loop
is: explore a resource, check understanding, review feedback, then choose the next
resource or practice activity. Educator and administration workflows need separate
discovery before implementation.

## MVP target (future work)

1. Student accounts with secure sessions and ownership of learning records.
2. A course/resource catalog with lectures and reading materials.
3. Progress tracking with resume and completion states.
4. Concept-tagged quizzes, attempts, results, and helpful feedback.
5. A student overview of strengths, gaps, and concept mastery evidence.
6. Explainable recommendations, beginning with deterministic rules.
7. Carefully evaluated AI assistance after the underlying learning data is reliable.

MVP success should be evaluated through useful next-step recommendations, reliable
progress records, accessibility, and feedback from actual students. No numerical
targets or learning-outcome claims have been established yet.

## Later integrations

Google Classroom and Microsoft Teams for Education will eventually supply
authorized resources. Each connector needs current API verification, appropriate
permissions, explicit consent, ownership checks, revocation, and failure handling.
Authentication through Google or Microsoft alone does not grant permission to
import classroom content. These integrations are outside the initial MVP foundation.

## Phase 1 delivered scope

Only the application foundation, public landing page, reusable UI basics,
configuration, testing scaffold, and product/architecture/roadmap documentation.
The landing illustration is static sample content. It does not track learning or
offer a working course. No authentication, database, quiz, AI, or integration
implementation is authorized in this phase.
