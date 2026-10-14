import "server-only";
import { z } from "zod";
import { getDb } from "@/server/db";
import { requireRole } from "@/server/auth/session";
import { AuthorizationError } from "@/features/auth/policy";

export async function getAiLessonContext(lessonId: string, audience: "STUDENT" | "TEACHER") {
  const user = await requireRole([audience]);
  z.uuid().parse(lessonId);
  const lesson = await getDb().lesson.findFirst({
    where: { id: lessonId, module: { course: audience === "STUDENT"
      ? { status: "PUBLISHED", enrollments: { some: { studentId: user.id } } }
      : { ownerId: user.id } } },
    select: { id: true, title: true, concepts: { orderBy: { conceptId: "asc" }, take: 3,
      select: { concept: { select: { id: true, name: true, description: true } } } } },
  });
  if (!lesson) throw new AuthorizationError(404, "Lesson not found.");
  // The schema has concept notes, not lesson bodies. Do not silently invent one.
  const sources = lesson.concepts.flatMap(({ concept }) => concept.description?.trim()
    ? [{ id: concept.id, name: concept.name, text: concept.description.trim().slice(0, 500) }] : []);
  return { userId: user.id, lessonId: lesson.id, title: lesson.title, sources };
}

export async function listAiLessons(audience: "STUDENT" | "TEACHER") {
  const user = await requireRole([audience]);
  return getDb().lesson.findMany({
    where: { module: { course: audience === "STUDENT"
      ? { status: "PUBLISHED", enrollments: { some: { studentId: user.id } } }
      : { ownerId: user.id } } },
    select: { id: true, title: true }, orderBy: { id: "asc" }, take: 50,
  });
}
