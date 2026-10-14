import "server-only";
import { LocalAiError } from "@/server/ai/contracts";
import { jsonError, privateJson } from "@/server/http";
import { readBoundedText } from "@/server/ai/ollama";

export async function readAiInput(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new LocalAiError("input-limit", "Send a JSON request.");
  }
  const size = Number(request.headers.get("content-length"));
  if (Number.isFinite(size) && size > 12000) throw new LocalAiError("input-limit", "The request is too large.");
  if (!request.body) throw new SyntaxError("A JSON body is required.");
  let text: string;
  try { text = await readBoundedText(new Response(request.body), 12000); }
  catch (error) {
    if (error instanceof LocalAiError && error.code === "invalid-output") {
      throw new LocalAiError("input-limit", "The request is too large.");
    }
    throw error;
  }
  return JSON.parse(text);
}

export function aiErrorResponse(error: unknown) {
  if (error instanceof LocalAiError) {
    const status = error.code === "rate-limit" || error.code === "busy" ? 429
      : error.code === "input-limit" ? 413 : error.code === "cancelled" ? 499
      : error.code === "timeout" ? 504 : 503;
    return privateJson({ error: error.message, code: error.code }, status);
  }
  return jsonError(error);
}
