import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/server/auth/auth";
import { getDb } from "@/server/db";
import { AuthorizationError, assertRole, dashboardPath, type Role } from "@/features/auth/policy";

export async function getCurrentUser() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  // Re-read the current role and identity. Do not authorize from client/session claims.
  return getDb().user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthorizationError(401, "Sign in to continue.");
  return user;
}

export async function requireDashboardUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(dashboardPath(user.role));
  return user;
}

export async function requireRole(allowed: readonly Role[]) {
  const user = await requireUser();
  assertRole(user, allowed);
  return user;
}
