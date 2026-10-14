import { requireRole } from "@/server/auth/session";
import { assertSameOrigin, privateJson } from "@/server/http";
import { generatePracticeDraft } from "@/server/ai/learning";
import { aiErrorResponse, readAiInput } from "@/server/ai/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireRole(["TEACHER"]);
    return privateJson(await generatePracticeDraft(await readAiInput(request), request.signal));
  } catch (error) { return aiErrorResponse(error); }
}
