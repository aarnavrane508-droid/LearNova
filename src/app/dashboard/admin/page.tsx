import { requireDashboardUser } from "@/server/auth/session";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function AdminDashboard() {
  const user = await requireDashboardUser("ADMIN");
  return <DashboardShell user={user} />;
}
