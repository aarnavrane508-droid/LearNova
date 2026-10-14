import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("Set TEST_DATABASE_URL to a migrated local PostgreSQL database ending in _test.");
const url = new URL(databaseUrl);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !url.pathname.endsWith("_test")) {
  throw new Error("Database tests require a dedicated local PostgreSQL database ending in _test.");
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const suffix = randomUUID();
let teacherId: string;
let studentId: string;
let courseId: string;
let lessonId: string;
let conceptId: string;

beforeAll(async () => {
  const teacher = await db.user.create({ data: { name: "Test Teacher", email: `teacher-${suffix}@example.test`, role: "TEACHER", accountType: "TEACHER" } });
  teacherId = teacher.id;
  const student = await db.user.create({ data: { name: "Test Student", email: `student-${suffix}@example.test`, role: "STUDENT" } });
  studentId = student.id;
  const course = await db.course.create({ data: { ownerId: teacherId, slug: `course-${suffix}`, title: "Relationship test", status: "PUBLISHED" } });
  courseId = course.id;
  const courseModule = await db.module.create({ data: { courseId, title: "Test module", position: 1 } });
  lessonId = (await db.lesson.create({ data: { moduleId: courseModule.id, title: "Test lesson", position: 1 } })).id;
  conceptId = (await db.concept.create({ data: { slug: `concept-${suffix}`, name: "Test concept" } })).id;
});

afterAll(async () => {
  try {
    if (courseId) await db.course.deleteMany({ where: { id: courseId } });
    if (conceptId) await db.concept.deleteMany({ where: { id: conceptId } });
    await db.user.deleteMany({ where: { email: { endsWith: `${suffix}@example.test` } } });
  } finally { await db.$disconnect(); }
});

describe("real PostgreSQL relationship constraints", () => {
  it("automatically provisions exactly one profile per user", async () => {
    expect(await db.profile.count({ where: { userId: studentId } })).toBe(1);
    await expect(db.profile.create({ data: { userId: studentId } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("rejects enrollment in a nonexistent course", async () => {
    await expect(db.enrollment.create({ data: { studentId, courseId: randomUUID() } })).rejects.toMatchObject({ code: "P2003" });
  });

  it("enforces one enrollment per student and course", async () => {
    await db.enrollment.create({ data: { studentId, courseId } });
    await expect(db.enrollment.create({ data: { studentId, courseId } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("rejects teacher enrollments and student course ownership", async () => {
    await expect(db.enrollment.create({ data: { studentId: teacherId, courseId } })).rejects.toThrow();
    await expect(db.course.create({ data: { ownerId: studentId, slug: `invalid-${suffix}`, title: "Invalid owner" } })).rejects.toThrow();
  });

  it("rejects role changes that invalidate owned courses or enrollments", async () => {
    await expect(db.user.update({ where: { id: teacherId }, data: { role: "STUDENT" } })).rejects.toThrow();
    await expect(db.user.update({ where: { id: studentId }, data: { role: "TEACHER" } })).rejects.toThrow();
  });

  it("maps a lesson to multiple concepts and rejects duplicate mappings", async () => {
    await db.lessonConcept.create({ data: { lessonId, conceptId } });
    await expect(db.lessonConcept.create({ data: { lessonId, conceptId } })).rejects.toMatchObject({ code: "P2002" });
    const another = await db.concept.create({ data: { slug: `second-${suffix}`, name: "Second concept" } });
    try {
      await db.lessonConcept.create({ data: { lessonId, conceptId: another.id } });
      expect(await db.lessonConcept.count({ where: { lessonId } })).toBe(2);
    } finally {
      await db.lessonConcept.deleteMany({ where: { conceptId: another.id } });
      await db.concept.delete({ where: { id: another.id } });
    }
  });

  it("restricts deletion of a concept while it is mapped", async () => {
    await expect(db.concept.delete({ where: { id: conceptId } })).rejects.toMatchObject({ code: "P2003" });
  });

  it("keeps course-to-module and module-to-lesson ordering unique", async () => {
    await expect(db.module.create({ data: { courseId, title: "Duplicate position", position: 1 } })).rejects.toMatchObject({ code: "P2002" });
    const lesson = await db.lesson.findUniqueOrThrow({ where: { id: lessonId } });
    await expect(db.lesson.create({ data: { moduleId: lesson.moduleId, title: "Duplicate position", position: 1 } })).rejects.toMatchObject({ code: "P2002" });
  });

  it("cascades course structure and enrollment deletion", async () => {
    await db.course.delete({ where: { id: courseId } });
    expect(await db.module.count({ where: { courseId } })).toBe(0);
    expect(await db.lesson.count({ where: { id: lessonId } })).toBe(0);
    expect(await db.lessonConcept.count({ where: { lessonId } })).toBe(0);
    expect(await db.enrollment.count({ where: { courseId } })).toBe(0);
    expect(await db.concept.count({ where: { id: conceptId } })).toBe(1);
  });
});
