import { requireRole } from "@/server/auth/session";
import { assertSameOrigin, privateJson } from "@/server/http";
import { prepareTutor } from "@/server/ai/learning";
import { aiErrorResponse, readAiInput } from "@/server/ai/http";
import { LocalAiError } from "@/server/ai/contracts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireRole(["STUDENT"]);
    const controller = new AbortController();
    const { context, stream } = await prepareTutor(await readAiInput(request), AbortSignal.any([request.signal, controller.signal]));
    if (!stream) return privateJson({ status: "no-context", message: "This lesson has no concept notes available. The tutor cannot give a grounded answer yet." });
    const encoder = new TextEncoder();
    return new Response(new ReadableStream({
      async start(output) {
        const send = (value: unknown) => output.enqueue(encoder.encode(JSON.stringify(value) + "\n"));
        try {
          send({ type: "sources", sources: context.sources.map(({ id, name }) => ({ id, name })) });
          for await (const text of stream) send({ type: "text", text });
          send({ type: "done" });
        } catch (error) {
          if (!controller.signal.aborted && !request.signal.aborted) {
            send({ type: "error", message: error instanceof LocalAiError ? error.message : "The local answer was interrupted. Please retry." });
          }
        } finally { if (!controller.signal.aborted) output.close(); }
      },
      cancel() { controller.abort(); },
    }), { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return aiErrorResponse(error); }
}
