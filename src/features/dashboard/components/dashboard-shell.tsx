import Link from "next/link";
import { BookOpen, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { dashboardPath, type Role } from "@/features/auth/policy";

type DashboardUser = { id: string; name: string; email: string; role: Role };

export function DashboardShell({ user }: { user: DashboardUser }) {
  const label = user.role === "TEACHER" ? "Teacher" : user.role === "ADMIN" ? "Administrator" : "Student";
  return (
    <div className="min-h-screen">
      <header className="container-shell flex flex-wrap items-center justify-between gap-4 border-b py-6"><Brand /><LogoutButton /></header>
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[200px_1fr]">
        <nav aria-label="Dashboard navigation" className="space-y-3">
          <p className="eyebrow mb-5 text-muted-foreground">{label} workspace</p>
          <Link href={dashboardPath(user.role)} aria-current="page" className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm font-medium"><LayoutDashboard aria-hidden="true" className="size-4" />Overview</Link>
          <Link href="/" className="block rounded-xl px-4 py-3 text-sm text-muted-foreground">Public homepage</Link>
        </nav>
        <main className="min-w-0" id="dashboard-content">
          <p className="eyebrow mb-4 text-muted-foreground">{label} dashboard</p>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Welcome, {user.name}.</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">Your account is ready. This workspace is a foundation for the learning tools ahead.</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Card><CardHeader><ShieldCheck aria-hidden="true" className="mb-3 size-6 text-primary" /><CardTitle>Your account</CardTitle><CardDescription>{user.email}<br />Signed in as a {label.toLowerCase()}.</CardDescription></CardHeader></Card>
            <Card><CardHeader><BookOpen aria-hidden="true" className="mb-3 size-6 text-primary" /><CardTitle>{user.role === "TEACHER" ? "Your teaching space" : user.role === "ADMIN" ? "Platform administration" : "Your learning space"}</CardTitle><CardDescription>Course and learning workflows are planned for the next phase. No progress or mastery data is shown yet.</CardDescription></CardHeader></Card>
          </div>
        </main>
      </div>
    </div>
  );
}
