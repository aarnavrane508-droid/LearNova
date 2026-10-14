"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LocalAiStatus } from "@/features/local-ai/components/local-ai-status";
import { practiceDraftSchema } from "@/features/local-ai/schemas";

const responseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("draft"), reviewRequired: z.literal(true), published: z.literal(false), draft: practiceDraftSchema }),
  z.object({ status: z.literal("no-context"), message: z.string() }),
]);

export function PracticeDrafts({ lessons }: { lessons: { id: string; title: string }[] }) {
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [kind, setKind] = useState("SINGLE_CHOICE");
  const [difficulty, setDifficulty] = useState("EASY");
  const [draft, setDraft] = useState<z.infer<typeof practiceDraftSchema> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function generate(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const request = new AbortController(); controller.current = request;
    setBusy(true); setError(""); setDraft(null);
    try {
      const response = await fetch("/api/local-ai/practice-drafts", { method: "POST", signal: request.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, kind, difficulty }) });
      const data: unknown = await response.json();
      if (!response.ok) { const failure = z.object({ error: z.string() }).safeParse(data); throw new Error(failure.success ? failure.data.error : "Local AI could not create a draft."); }
      const result = responseSchema.parse(data);
      if (result.status === "no-context") throw new Error(result.message);
      setDraft(result.draft);
    } catch (failure) { setError(request.signal.aborted ? "Request cancelled." : failure instanceof Error ? failure.message : "Draft unavailable."); }
    finally { setBusy(false); controller.current = null; }
  }
  return <div className="space-y-6"><LocalAiStatus />
    <p className="text-sm leading-7 text-muted-foreground">Generate one draft from your lesson’s mapped concept notes. Review every fact, answer, and concept tag. Drafts are not saved or published; the scored assessment and approval workflow is not implemented.</p>
    {!lessons.length ? <p className="rounded-2xl border p-6">No owned lessons are available. Add course materials and concept notes before generating drafts.</p> : <form onSubmit={generate} className="space-y-4 rounded-2xl border bg-card p-6">
      <label className="block text-sm font-medium">Lesson<select aria-label="Lesson" className="mt-2 block w-full rounded-lg border bg-background p-3" value={lessonId} onChange={event => setLessonId(event.target.value)} disabled={busy}>{lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label>
      <label className="block text-sm font-medium">Question type<select className="mt-2 block w-full rounded-lg border bg-background p-3" value={kind} onChange={event => setKind(event.target.value)} disabled={busy}><option value="SINGLE_CHOICE">Multiple choice · one answer</option><option value="MULTIPLE_SELECT">Multiple select</option><option value="SHORT_ANSWER">Short answer</option></select></label>
      <label className="block text-sm font-medium">Difficulty<select className="mt-2 block w-full rounded-lg border bg-background p-3" value={difficulty} onChange={event => setDifficulty(event.target.value)} disabled={busy}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>
      <div className="flex gap-3"><Button disabled={busy} type="submit">{busy ? "Generating locally…" : "Generate review draft"}</Button>{busy && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}>Cancel</Button>}</div>
    </form>}
    {error && <p role="alert" className="text-sm text-destructive">{error} You can retry using Generate review draft.</p>}
    {draft && <section aria-label="Practice draft" className="space-y-4 rounded-2xl border bg-card p-6"><h2 className="text-lg font-semibold">Unapproved practice draft</h2><p className="whitespace-pre-wrap">{draft.prompt}</p>
      <ol className="list-inside list-decimal space-y-2">{draft.options.map((option, index) => <li key={index}>{option}{draft.correctOptions.includes(index) ? " — proposed correct answer" : ""}</li>)}</ol>
      <p className="whitespace-pre-wrap text-sm leading-7">{draft.explanation}</p><p className="break-all text-xs text-muted-foreground">Concept IDs: {draft.conceptIds.join(", ")}</p>
      <p className="text-sm font-medium">Teacher review required. No assessment has been published.</p></section>}
  </div>;
}
