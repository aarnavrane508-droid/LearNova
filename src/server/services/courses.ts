import "server-only";
import { requireUser, requireRole } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { AuthorizationError, assertCanManageCourse, assertCanReadCourse, assertCanEnroll } from "@/features/auth/policy";
import { courseSchema, uuidSchema } from "@/features/auth/validation";

export async function readCourse(courseId: string) {
  const actor = await requireUser();
  uuidSchema.parse(courseId);
  const course = await getDb().course.findUnique({ where: { id: courseId } });
  if (!course) throw new AuthorizationError(404, "Course not found.");
  const enrollment = actor.role === "STUDENT" ? await getDb().enrollment.findUnique({
    where: { studentId_courseId: { studentId: actor.id, courseId } }, select: { id: true },
  }) : null;
  assertCanReadCourse(actor, course, Boolean(enrollment));
  return { id: course.id, title: course.title, description: course.description, status: course.status };
}

export async function createCourse(input: unknown) {
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  const data = courseSchema.parse(input);
  return getDb().course.create({ data: { ...data, ownerId: actor.id }, select: { id: true, title: true } });
}

export async function updateCourse(courseId: string, input: unknown) {
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  uuidSchema.parse(courseId);
  const data = courseSchema.parse(input);
  // Ownership is included in the actual write, not just a prior read.
  const result = await getDb().course.updateMany({
    where: { id: courseId, ...(actor.role === "ADMIN" ? {} : { ownerId: actor.id }) }, data,
  });
  if (result.count !== 1) throw new AuthorizationError(404, "Course not found.");
}

export async function listCourseEnrollments(courseId: string) {
  const actor = await requireUser();
  uuidSchema.parse(courseId);
  const db = getDb();
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AuthorizationError(404, "Course not found.");
  assertCanManageCourse(actor, course);
  return db.enrollment.findMany({ where: { courseId }, select: { id: true, enrolledAt: true, student: { select: { id: true, name: true } } } });
}

export async function enrollInCourse(courseId: string) {
  const actor = await requireRole(["STUDENT"]);
  uuidSchema.parse(courseId);
  return getDb().$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: courseId } });
    if (!course) throw new AuthorizationError(404, "Course not found.");
    assertCanEnroll(actor, course, actor.id);
    // The API never accepts a studentId. Enrollment always belongs to the caller.
    return tx.enrollment.upsert({
      where: { studentId_courseId: { studentId: actor.id, courseId } },
      create: { courseId, studentId: actor.id }, update: {},
      select: { id: true, courseId: true, enrolledAt: true },
    });
  }, { isolationLevel: "Serializable" });
}

export async function leaveCourse(courseId: string) {
  const actor = await requireRole(["STUDENT"]);
  uuidSchema.parse(courseId);
  await getDb().enrollment.deleteMany({ where: { studentId: actor.id, courseId } });
}
