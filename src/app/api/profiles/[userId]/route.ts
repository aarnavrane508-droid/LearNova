import { getPrivateProfile } from "@/server/services/profile";
import { uuidSchema } from "@/features/auth/validation";
import { jsonError, privateJson } from "@/server/http";

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try { const { userId } = await context.params; uuidSchema.parse(userId); return privateJson(await getPrivateProfile(userId)); }
  catch (error) { return jsonError(error); }
}
