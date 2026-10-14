import { redirect } from "next/navigation";
import { requireDashboardUser } from "@/server/auth/session";
import { dashboardPath } from "@/features/auth/policy";

export default async function DashboardPage() {
  const user = await requireDashboardUser();
  redirect(dashboardPath(user.role));
}
