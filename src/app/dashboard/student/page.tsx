import { requireDashboardUser } from "@/server/auth/session";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function StudentDashboard() {
  const user = await requireDashboardUser("STUDENT");
  return <DashboardShell user={user} />;
}
