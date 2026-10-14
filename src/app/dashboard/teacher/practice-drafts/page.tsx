import Link from "next/link";
import { requireDashboardUser } from "@/server/auth/session";
import { listAiLessons } from "@/server/ai/lesson-context";
import { PracticeDrafts } from "@/features/local-ai/components/practice-drafts";

export default async function PracticeDraftPage() {
  await requireDashboardUser("TEACHER");
  const lessons = await listAiLessons("TEACHER");
  return <main className="container-shell max-w-4xl space-y-6 py-10"><Link href="/dashboard/teacher" className="text-sm underline">Back to dashboard</Link><h1 className="font-display text-4xl">Local practice drafts</h1><PracticeDrafts lessons={lessons} /></main>;
}
