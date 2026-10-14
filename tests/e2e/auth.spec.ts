import { randomUUID, randomBytes } from "node:crypto";
import { test, expect } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { hashPassword, verifyPassword } from "better-auth/crypto";

test.describe.configure({ mode: "serial" });
const baseURL = "http://127.0.0.1:3100";
const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) throw new Error("Authentication tests require E2E_DATABASE_URL.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const suffix = randomUUID();
const password = randomBytes(24).toString("base64url");
let studentId: string;
let otherStudentId: string;
let teacherId: string;
let otherTeacherId: string;
let courseId: string;
let draftId: string;
const email = (label: string) => `${label}-${suffix}@example.test`;

test.beforeAll(async () => {
  const hash = await hashPassword(password);
  for (const [label, role] of [["student", "STUDENT"], ["other-student", "STUDENT"], ["teacher", "TEACHER"], ["other-teacher", "TEACHER"], ["admin", "ADMIN"]] as const) {
    const user = await db.user.create({ data: { name: `Test ${label}`, email: email(label), role, accountType: role === "ADMIN" ? "TEACHER" : role } });
    await db.account.create({ data: { userId: user.id, accountId: user.id, providerId: "credential", password: hash } });
    if (label === "student") studentId = user.id;
    if (label === "other-student") otherStudentId = user.id;
    if (label === "teacher") teacherId = user.id;
    if (label === "other-teacher") otherTeacherId = user.id;
  }
  courseId = (await db.course.create({ data: { ownerId: teacherId, title: "Published fixture", slug: `published-${suffix}`, status: "PUBLISHED" } })).id;
  draftId = (await db.course.create({ data: { ownerId: teacherId, title: "Draft fixture", slug: `draft-${suffix}` } })).id;
});

test.beforeEach(async () => {
  // The test database is dedicated and serial. Production throttling remains on.
  await db.rateLimit.deleteMany();
});

test.afterAll(async () => {
  try {
    await db.course.deleteMany({ where: { ownerId: { in: [teacherId, otherTeacherId].filter(Boolean) } } });
    await db.user.deleteMany({ where: { email: { endsWith: `${suffix}@example.test` } } });
  } finally { await db.$disconnect(); }
});

test("unauthenticated and forged-cookie requests cannot access dashboards", async ({ page }) => {
  await page.context().addCookies([{ name: "better-auth.session_token", value: "forged-token", domain: "127.0.0.1", path: "/" }]);
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/profile")).status()).toBe(401);
});

test("registration creates a student with a hashed password and a private profile", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Registered Student");
  await page.getByLabel("Email address").fill(email("registered-student"));
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard\/student$/);
  const user = await db.user.findUniqueOrThrow({ where: { email: email("registered-student") } });
  expect(user.role).toBe("STUDENT");
  expect(user.emailVerified).toBe(false);
  expect(await db.profile.count({ where: { userId: user.id } })).toBe(1);
  const account = await db.account.findFirstOrThrow({ where: { userId: user.id, providerId: "credential" } });
  expect(account.password).not.toBe(password);
  expect(await verifyPassword({ hash: account.password!, password })).toBe(true);
});

test("teacher signup routes to the teacher shell", async ({ page }) => {
  const response = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: baseURL }, data: { name: "Registered Teacher", email: email("registered-teacher"), password, accountType: "TEACHER" },
  });
  expect(response.ok()).toBe(true);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/teacher$/);
});

test("public signup cannot assign an admin role or verified status", async ({ request }) => {
  for (const extra of [{ accountType: "ADMIN" }, { role: "ADMIN" }, { emailVerified: true }]) {
    const response = await request.post("/api/auth/sign-up/email", {
      headers: { origin: baseURL }, data: { name: "Rejected Admin", email: email("rejected-admin"), password, accountType: "STUDENT", ...extra },
    });
    expect(response.status()).toBe(400);
  }
  expect(await db.user.count({ where: { email: email("rejected-admin") } })).toBe(0);
});

test("login handles invalid credentials, role boundaries, and logout", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email("student"));
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t sign you in");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard\/student$/);
  await page.goto("/dashboard/teacher");
  await expect(page).toHaveURL(/\/dashboard\/student$/);
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/dashboard\/student$/);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("profile isolation and enrollment cannot be bypassed by caller-supplied IDs", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("student"), password } })).ok()).toBe(true);
  expect((await page.request.get(`/api/profiles/${otherStudentId}`)).status()).toBe(404);
  expect((await page.request.get(`/api/profiles/${studentId}`)).status()).toBe(200);
  expect((await page.request.get(`/api/courses/${courseId}`)).status()).toBe(404);
  expect((await page.request.post(`/api/courses/${courseId}/enrollments`, { headers: { origin: baseURL }, data: { studentId: otherStudentId } })).status()).toBe(400);
  expect((await page.request.post(`/api/courses/${draftId}/enrollments`, { headers: { origin: baseURL }, data: {} })).status()).toBe(404);
  for (let i = 0; i < 2; i++) expect((await page.request.post(`/api/courses/${courseId}/enrollments`, { headers: { origin: baseURL }, data: {} })).status()).toBe(200);
  expect(await db.enrollment.count({ where: { studentId, courseId } })).toBe(1);
  expect(await db.enrollment.count({ where: { studentId: otherStudentId, courseId } })).toBe(0);
  expect((await page.request.get(`/api/courses/${courseId}`)).status()).toBe(200);
  expect((await page.request.get(`/api/courses/${courseId}/enrollments`)).status()).toBe(404);
  expect((await page.request.delete(`/api/courses/${courseId}/enrollments`, { headers: { origin: baseURL }, data: {} })).status()).toBe(204);
  expect((await page.request.get(`/api/courses/${courseId}`)).status()).toBe(404);
});

test("teachers cannot modify another teacher's course or enroll as students", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("other-teacher"), password } })).ok()).toBe(true);
  expect((await page.request.patch(`/api/courses/${courseId}`, { headers: { origin: baseURL }, data: { title: "Hijacked", slug: `hijacked-${suffix}` } })).status()).toBe(404);
  expect((await page.request.post(`/api/courses/${courseId}/enrollments`, { headers: { origin: baseURL }, data: {} })).status()).toBe(403);
  expect((await page.request.get(`/api/courses/${courseId}/enrollments`)).status()).toBe(404);
  expect((await page.request.post("/api/auth/update-user", { headers: { origin: baseURL }, data: { role: "ADMIN" } })).status()).toBe(404);
});

test("expired sessions are rejected after a fresh request", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("student"), password } })).ok()).toBe(true);
  await db.session.updateMany({ where: { userId: studentId }, data: { expiresAt: new Date(0) } });
  await page.goto("/dashboard/student");
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/profile")).status()).toBe(401);
});

test("trusted admin sessions get the admin shell but no access to private profiles", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("admin"), password } })).ok()).toBe(true);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/admin$/);
  expect((await page.request.get(`/api/profiles/${studentId}`)).status()).toBe(404);
  expect((await page.request.get(`/api/courses/${courseId}/enrollments`)).status()).toBe(200);
});

test("login rate limiting is enforced through the real HTTP handler", async ({ request }) => {
  for (let i = 0; i < 5; i++) {
    const response = await request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("student"), password: "incorrect-password" } });
    expect(response.status()).toBe(401);
  }
  const limited = await request.post("/api/auth/sign-in/email", { headers: { origin: baseURL }, data: { email: email("student"), password: "incorrect-password" } });
  expect(limited.status()).toBe(429);
});

test("cross-origin state changes are rejected", async ({ page }) => {
  const response = await page.request.post("/api/auth/sign-in/email", { headers: { origin: "https://untrusted.example" }, data: { email: email("student"), password } });
  expect(response.status()).toBe(403);
  expect((await page.request.post(`/api/courses/${courseId}/enrollments`, { headers: { origin: "https://untrusted.example" }, data: {} })).status()).toBe(403);
});
