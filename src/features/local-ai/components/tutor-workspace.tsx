"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { LocalAiStatus } from "@/features/local-ai/components/local-ai-status";
import type { TutorHistory } from "@/features/local-ai/schemas";

const eventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("sources"), sources: z.array(z.object({ id: z.uuid(), name: z.string() })) }),
  z.object({ type: z.literal("error"), message: z.string() }),
  z.object({ type: z.literal("done") }),
]);
const errorSchema = z.object({ error: z.string().optional(), message: z.string().optional() });
type LessonOption = { id: string; title: string };

export function TutorWorkspace({ lessons }: { lessons: LessonOption[] }) {
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("explain");
  const [history, setHistory] = useState<TutorHistory>([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function ask(event?: FormEvent) {
    event?.preventDefault();
    if (busy || !question.trim() || !lessonId) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true); setError(""); setAnswer(""); setSources([]);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch("/api/local-ai/tutor", { method: "POST", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, question, mode, history }) });
      if (!response.ok || response.headers.get("content-type")?.includes("application/json")) {
        const result = errorSchema.parse(await response.json());
        throw new Error(result.error ?? result.message ?? "Local AI could not respond.");
      }
      if (!response.body) throw new Error("The local response was empty.");
      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let complete = false;
      let text = "";
      while (!complete) {
        const item = await reader.read();
        buffer += item.done ? decoder.decode() : decoder.decode(item.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = item.done ? "" : lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const value = eventSchema.parse(JSON.parse(line));
          if (value.type === "error") throw new Error(value.message);
          if (value.type === "sources") setSources(value.sources);
          if (value.type === "text") { text += value.text; setAnswer(text); }
          if (value.type === "done") complete = true;
        }
        if (item.done && !complete) throw new Error("The answer was interrupted. Please retry.");
      }
      setHistory(previous => [...previous, { role: "user" as const, content: question.slice(0, 600) },
        { role: "assistant" as const, content: text.slice(0, 600) }].slice(-4));
    } catch (failure) {
      setError(controller.signal.aborted ? "Request cancelled." : failure instanceof Error ? failure.message : "Local AI could not respond.");
    } finally {
      await reader?.cancel().catch(() => undefined); reader?.releaseLock();
      setBusy(false); active.current = null;
    }
  }

  return <div className="space-y-6">
    <LocalAiStatus />
    <p className="text-sm leading-7 text-muted-foreground">Answers use concept notes mapped to your enrolled lessons. Full lesson content, quiz feedback, and mastery personalization are not available yet. AI can make mistakes; check explanations against your notes.</p>
    {!lessons.length ? <p className="rounded-2xl border p-6">No accessible lessons yet. A published course enrollment and mapped concept notes are needed before tutoring is available.</p> : <>
      <form onSubmit={ask} className="space-y-4 rounded-2xl border bg-card p-6">
        <label className="block text-sm font-medium">Lesson
          <select aria-label="Lesson" className="mt-2 block w-full rounded-lg border bg-background p-3" value={lessonId} disabled={busy} onChange={event => { setLessonId(event.target.value); setHistory([]); setAnswer(""); setSources([]); setError(""); }}>
            {lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">How can I help?
          <select className="mt-2 block w-full rounded-lg border bg-background p-3" value={mode} onChange={event => setMode(event.target.value)} disabled={busy}>
            <option value="explain">Explain a concept</option><option value="example">Give an example</option><option value="hint">Give a hint</option><option value="summarize">Summarize the notes</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">{["Explain the main idea simply.", "Show a small worked example.", "What should I review in these notes?"].map(suggestion => <Button key={suggestion} type="button" variant="outline" size="sm" disabled={busy} onClick={() => setQuestion(suggestion)}>{suggestion}</Button>)}</div>
        <label className="block text-sm font-medium">Your question
          <textarea className="mt-2 block min-h-28 w-full rounded-lg border bg-background p-3 focus-visible:ring-2 focus-visible:ring-ring" maxLength={400} required value={question} disabled={busy} onChange={event => setQuestion(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy}>{busy ? "Loading or generating locally…" : "Ask local tutor"}</Button>
          {busy && <Button type="button" variant="outline" onClick={() => active.current?.abort()}>Cancel</Button>}
          {!busy && history.length > 0 && <Button type="button" variant="ghost" onClick={() => { setHistory([]); setAnswer(""); setSources([]); }}>Clear conversation</Button>}
        </div>
      </form>
      {error && <div role="alert" className="rounded-xl border p-4 text-sm"><p>{error}</p><Button className="mt-3" variant="outline" disabled={busy} onClick={() => void ask()}>Retry</Button></div>}
      {answer && <section aria-label="Tutor answer" aria-busy={busy} className="rounded-2xl border bg-card p-6"><h2 className="mb-4 text-lg font-semibold">Local tutor</h2><p className="whitespace-pre-wrap break-words text-sm leading-7">{answer}</p></section>}
      <p className="sr-only" role="status">{busy ? "Local model is generating an answer." : answer ? "Answer complete or stopped." : ""}</p>
      {sources.length > 0 && <div className="text-sm text-muted-foreground"><p>Concept notes supplied to the model:</p><ul className="mt-2 list-inside list-disc">{sources.map(source => <li key={source.id}>{source.name}</li>)}</ul></div>}
      {history.length > 0 && <details className="text-sm"><summary className="cursor-pointer">Recent conversation · this page session only</summary><div className="mt-4 space-y-3">{history.map((message, index) => <p key={index} className="whitespace-pre-wrap break-words"><strong>{message.role === "user" ? "You" : "Tutor"}:</strong> {message.content}</p>)}</div></details>}
    </>}
  </div>;
}
