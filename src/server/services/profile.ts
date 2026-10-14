import "server-only";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { assertSelf } from "@/features/auth/policy";
import { profileSchema } from "@/features/auth/validation";

export async function getPrivateProfile(userId: string) {
  const actor = await requireUser();
  assertSelf(actor, userId);
  return getDb().profile.findUnique({
    where: { userId: actor.id },
    select: { bio: true, timezone: true, createdAt: true, updatedAt: true },
  });
}

export async function updateOwnProfile(input: unknown) {
  const actor = await requireUser();
  const data = profileSchema.parse(input);
  return getDb().profile.upsert({ where: { userId: actor.id }, create: { userId: actor.id, ...data }, update: data });
}
