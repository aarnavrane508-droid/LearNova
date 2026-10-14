import { z } from "zod";

export const tutorInputSchema = z.object({
  lessonId: z.uuid(), question: z.string().trim().min(1).max(400),
  mode: z.enum(["explain", "example", "hint", "summarize"]).default("explain"),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(600) }).strict()).max(4).default([]),
}).strict();

export const draftInputSchema = z.object({
  lessonId: z.uuid(), kind: z.enum(["SINGLE_CHOICE", "MULTIPLE_SELECT", "SHORT_ANSWER"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
}).strict();

export const practiceDraftSchema = z.object({
  kind: z.enum(["SINGLE_CHOICE", "MULTIPLE_SELECT", "SHORT_ANSWER"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  prompt: z.string().min(5).max(1000),
  options: z.array(z.string().min(1).max(300)).max(5),
  correctOptions: z.array(z.number().int().min(0).max(4)).max(5),
  explanation: z.string().min(5).max(1200),
  conceptIds: z.array(z.uuid()).min(1).max(3),
}).strict();

export function practiceGenerationSchema(
  kind: z.infer<typeof draftInputSchema>["kind"],
  difficulty: z.infer<typeof draftInputSchema>["difficulty"],
  allowedConcepts: string[],
) {
  if (!allowedConcepts.length) throw new Error("Source concepts are required.");
  // Constrain generation itself, then still validate semantic consistency afterward.
  // Fixed four-choice output prevents generated indexes from referencing absent options.
  const optionIndex = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
  return practiceDraftSchema.extend({
    kind: z.literal(kind), difficulty: z.literal(difficulty),
    conceptIds: z.array(z.enum(allowedConcepts)).min(1).max(allowedConcepts.length),
    options: z.array(z.string().min(1).max(300)).length(kind === "SHORT_ANSWER" ? 0 : 4),
    correctOptions: kind === "SHORT_ANSWER" ? z.array(optionIndex).length(0)
      : kind === "SINGLE_CHOICE" ? z.array(optionIndex).length(1) : z.array(optionIndex).min(2).max(3),
  });
}

export function validatePracticeDraft(value: unknown, allowedConcepts: readonly string[]) {
  const draft = practiceDraftSchema.parse(value);
  if (draft.conceptIds.some(id => !allowedConcepts.includes(id)) || new Set(draft.conceptIds).size !== draft.conceptIds.length) {
    throw new Error("The generated draft refers to an unavailable concept.");
  }
  if (draft.kind === "SHORT_ANSWER") {
    if (draft.options.length || draft.correctOptions.length) throw new Error("Short-answer drafts cannot contain choice keys.");
  } else {
    if (draft.options.length < 2 || new Set(draft.options).size !== draft.options.length ||
        !draft.correctOptions.length || draft.correctOptions.some(index => index >= draft.options.length) ||
        new Set(draft.correctOptions).size !== draft.correctOptions.length ||
        (draft.kind === "SINGLE_CHOICE" && draft.correctOptions.length !== 1) ||
        (draft.kind === "MULTIPLE_SELECT" && draft.correctOptions.length < 2)) {
      throw new Error("The generated answer choices are inconsistent.");
    }
  }
  return draft;
}

export type TutorHistory = z.infer<typeof tutorInputSchema>["history"];
