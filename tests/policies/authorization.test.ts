import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthorizationError, assertCanEnroll, assertCanManageCourse, assertCanReadCourse, assertRole, assertSelf, dashboardPath, parsePublicRole, type Actor } from "../../src/features/auth/policy.ts";

const student: Actor = { id: "student-one", role: "STUDENT" };
const teacher: Actor = { id: "teacher-one", role: "TEACHER" };
const admin: Actor = { id: "admin-one", role: "ADMIN" };
const published = { ownerId: teacher.id, status: "PUBLISHED" as const };

function forbidden(action: () => void, status: number) {
  assert.throws(action, (error: unknown) => error instanceof AuthorizationError && error.status === status);
}

test("public signup accepts student and teacher account types", () => {
  assert.equal(parsePublicRole("STUDENT"), "STUDENT");
  assert.equal(parsePublicRole("TEACHER"), "TEACHER");
});

test("public signup rejects admin, missing, and forged account types", () => {
  for (const role of ["ADMIN", "admin", "student", "", undefined, null, {}, ["TEACHER"]]) forbidden(() => parsePublicRole(role), 403);
});

test("student role cannot access teacher or administrator operations", () => {
  forbidden(() => assertRole(student, ["TEACHER", "ADMIN"]), 403);
  forbidden(() => assertRole(teacher, ["ADMIN"]), 403);
  assert.doesNotThrow(() => assertRole(admin, ["ADMIN"]));
});

test("private profiles are accessible only to their owner, including for admins", () => {
  assert.doesNotThrow(() => assertSelf(student, student.id));
  for (const actor of [student, teacher, admin]) forbidden(() => assertSelf(actor, "another-user"), 404);
});

test("teachers can manage only their own courses", () => {
  assert.doesNotThrow(() => assertCanManageCourse(teacher, published));
  forbidden(() => assertCanManageCourse({ id: "teacher-two", role: "TEACHER" }, published), 404);
  forbidden(() => assertCanManageCourse(student, published), 404);
});

test("admin course management is an explicit permission", () => {
  assert.doesNotThrow(() => assertCanManageCourse(admin, published));
});

test("students need enrollment to read a published course", () => {
  forbidden(() => assertCanReadCourse(student, published, false), 404);
  assert.doesNotThrow(() => assertCanReadCourse(student, published, true));
});

test("enrollment never exposes draft or archived course content", () => {
  for (const status of ["DRAFT", "ARCHIVED"] as const) forbidden(() => assertCanReadCourse(student, { ...published, status }, true), 404);
});

test("teacher read access also checks ownership", () => {
  assert.doesNotThrow(() => assertCanReadCourse(teacher, published, false));
  forbidden(() => assertCanReadCourse({ id: "teacher-two", role: "TEACHER" }, published, true), 404);
});

test("students can enroll only themselves", () => {
  assert.doesNotThrow(() => assertCanEnroll(student, published, student.id));
  forbidden(() => assertCanEnroll(student, published, "student-two"), 404);
});

test("teachers and admins cannot hold student enrollments", () => {
  for (const actor of [teacher, admin]) forbidden(() => assertCanEnroll(actor, published, actor.id), 403);
});

test("draft, archived, and self-owned courses reject enrollment", () => {
  for (const status of ["DRAFT", "ARCHIVED"] as const) forbidden(() => assertCanEnroll(student, { ...published, status }, student.id), 404);
  forbidden(() => assertCanEnroll(student, { ...published, ownerId: student.id }, student.id), 404);
});

test("every persisted role maps to its protected dashboard", () => {
  assert.equal(dashboardPath("STUDENT"), "/dashboard/student");
  assert.equal(dashboardPath("TEACHER"), "/dashboard/teacher");
  assert.equal(dashboardPath("ADMIN"), "/dashboard/admin");
});
