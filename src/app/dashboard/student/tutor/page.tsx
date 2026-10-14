import Link from "next/link";
import { requireDashboardUser } from "@/server/auth/session";
import { listAiLessons } from "@/server/ai/lesson-context";
import { TutorWorkspace } from "@/features/local-ai/components/tutor-workspace";

export default async function TutorPage() {
  await requireDashboardUser("STUDENT");
  const lessons = await listAiLessons("STUDENT");
  return <main className="container-shell max-w-4xl space-y-6 py-10"><Link href="/dashboard/student" className="text-sm underline">Back to dashboard</Link><h1 className="font-display text-4xl">Your local study tutor</h1><TutorWorkspace lessons={lessons} /></main>;
}
