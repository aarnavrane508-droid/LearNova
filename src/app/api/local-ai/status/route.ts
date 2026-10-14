import { requireUser } from "@/server/auth/session";
import { OllamaProvider } from "@/server/ai/ollama";
import { consumeAiQuota } from "@/server/ai/limits";
import { privateJson } from "@/server/http";
import { aiErrorResponse } from "@/server/ai/http";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    consumeAiQuota(`status:${user.id}`);
    return privateJson(await new OllamaProvider().availability(request.signal));
  } catch (error) { return aiErrorResponse(error); }
}
