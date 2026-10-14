import { requireUser } from "@/server/auth/session";
import { getPrivateProfile, updateOwnProfile } from "@/server/services/profile";
import { assertSameOrigin, jsonError, privateJson } from "@/server/http";

export async function GET() {
  try { const user = await requireUser(); return privateJson(await getPrivateProfile(user.id)); }
  catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request) {
  try { assertSameOrigin(request); return privateJson(await updateOwnProfile(await request.json())); }
  catch (error) { return jsonError(error); }
}
