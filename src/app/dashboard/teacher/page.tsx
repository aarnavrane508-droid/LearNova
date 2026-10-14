import { requireDashboardUser } from "@/server/auth/session";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function TeacherDashboard() {
  const user = await requireDashboardUser("TEACHER");
  return <DashboardShell user={user} />;
}
