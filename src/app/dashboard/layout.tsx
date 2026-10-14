import type { Metadata } from "next";
import { requireDashboardUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardUser();
  return children;
}
