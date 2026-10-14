import { randomBytes, randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { hashPassword } from "better-auth/crypto";

test.describe.configure({ mode: "serial" });
const databaseUrl = process.env.E2E_DATABASE_URL;
if (!databaseUrl) throw new Error("Local AI browser tests require the guarded E2E test database.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const suffix = randomUUID();
const password = randomBytes(24).toString("base64url");
const email = (role: string) => `ai-${role}-${suffix}@example.test`;
const origin = "http://127.0.0.1:3100";
const realModel = process.env.RUN_LOCAL_AI_E2E === "true";
let teacherId: string;
let courseId: string;
let lessonId: string;
let emptyLessonId: string;
let inaccessibleLessonId: string;
let conceptId: string;

test.beforeAll(async () => {
  const passwordHash = await hashPassword(password);
  const users = [];
  for (const role of ["teacher", "student", "other-teacher", "other-student"] as const) {
    const accountType = role.includes("teacher") ? "TEACHER" : "STUDENT";
    const user = await db.user.create({ data: { name: `AI test ${role}`, email: email(role), role: accountType, accountType } });
    await db.account.create({ data: { userId: user.id, accountId: user.id, providerId: "credential", password: passwordHash } });
    users.push(user);
  }
  teacherId = users[0].id;
  courseId = (await db.course.create({ data: { ownerId: teacherId, slug: `ai-${suffix}`, title: "AI integration test fixture", status: "PUBLISHED" } })).id;
  await db.enrollment.create({ data: { studentId: users[1].id, courseId } });
  const courseModule = await db.module.create({ data: { courseId, title: "Test module", position: 1 } });
  lessonId = (await db.lesson.create({ data: { moduleId: courseModule.id, title: "Addition test lesson", position: 1 } })).id;
  emptyLessonId = (await db.lesson.create({ data: { moduleId: courseModule.id, title: "Lesson without notes", position: 2 } })).id;
  conceptId = (await db.concept.create({ data: { slug: `ai-addition-${suffix}`, name: "Addition", description: "Addition combines quantities. Two apples plus two apples make four apples: 2 + 2 = 4. Three plus one also equals four." } })).id;
  await db.lessonConcept.create({ data: { lessonId, conceptId } });
  const draftCourse = await db.course.create({ data: { ownerId: teacherId, slug: `ai-private-${suffix}`, title: "Private fixture" } });
  const privateModule = await db.module.create({ data: { courseId: draftCourse.id, title: "Private", position: 1 } });
  inaccessibleLessonId = (await db.lesson.create({ data: { moduleId: privateModule.id, title: "Private notes", position: 1 } })).id;
});
test.beforeEach(async () => { await db.rateLimit.deleteMany(); });
test.afterAll(async () => {
  try {
    if (teacherId) await db.course.deleteMany({ where: { ownerId: teacherId } });
    if (conceptId) await db.concept.deleteMany({ where: { id: conceptId } });
    await db.user.deleteMany({ where: { email: { endsWith: `${suffix}@example.test` } } });
  } finally { await db.$disconnect(); }
});

test("AI endpoints require authentication and trusted origin", async ({ request }) => {
  expect((await request.get("/api/local-ai/status")).status()).toBe(401);
  expect((await request.post("/api/local-ai/tutor", { headers: { origin }, data: { lessonId, question: "Explain" } })).status()).toBe(401);
  expect((await request.post("/api/local-ai/tutor", { headers: { origin: "https://untrusted.example" }, data: {} })).status()).toBe(403);
});

test("students cannot access another course or inject learner/model context", async ({ request }) => {
  expect((await request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("student"), password } })).ok()).toBe(true);
  expect((await request.post("/api/local-ai/tutor", { headers: { origin }, data: { lessonId: inaccessibleLessonId, question: "Explain" } })).status()).toBe(404);
  expect((await request.post("/api/local-ai/tutor", { headers: { origin }, data: { lessonId, question: "Explain", mastery: 100 } })).status()).toBe(400);
  expect((await request.post("/api/local-ai/practice-drafts", { headers: { origin }, data: { lessonId, kind: "SINGLE_CHOICE", difficulty: "EASY" } })).status()).toBe(403);
});

test("missing lesson notes produce a clear limitation", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("student"), password } })).ok()).toBe(true);
  await page.goto("/dashboard/student/tutor");
  await page.getByLabel("Lesson", { exact: true }).selectOption(emptyLessonId);
  await page.getByLabel("Your question").fill("Explain the main idea.");
  await page.getByRole("button", { name: "Ask local tutor" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no concept notes" })).toBeVisible();
});

test("empty students see no other learner's lessons", async ({ page }) => {
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("other-student"), password } })).ok()).toBe(true);
  await page.goto("/dashboard/student/tutor");
  await expect(page.getByText("No accessible lessons yet.", { exact: false })).toBeVisible();
  expect((await page.request.post("/api/local-ai/tutor", { headers: { origin }, data: { lessonId, question: "Explain" } })).status()).toBe(404);
});

test("teacher drafts require ownership", async ({ request }) => {
  expect((await request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("other-teacher"), password } })).ok()).toBe(true);
  expect((await request.post("/api/local-ai/practice-drafts", { headers: { origin }, data: { lessonId, kind: "SINGLE_CHOICE", difficulty: "EASY" } })).status()).toBe(404);
});

test("disabled AI has a graceful UI state without production fake answers", async ({ page }) => {
  test.skip(realModel, "The separate real-model run enables inference.");
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("student"), password } })).ok()).toBe(true);
  await page.goto("/dashboard/student/tutor");
  await page.getByLabel("Lesson", { exact: true }).selectOption(lessonId);
  await page.getByLabel("Your question").fill("Explain addition.");
  await page.getByRole("button", { name: "Ask local tutor" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "disabled" })).toBeVisible();
});

test("actual local model answers an authorized student's lesson question", async ({ page }) => {
  test.skip(!realModel, "Requires installed Ollama model; mocks cannot satisfy this test.");
  test.setTimeout(180000);
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("student"), password } })).ok()).toBe(true);
  await page.goto("/dashboard/student/tutor");
  await page.getByLabel("Lesson", { exact: true }).selectOption(lessonId);
  await page.getByLabel("Your question").fill("Using these notes, what is two plus two? Answer briefly.");
  await page.getByRole("button", { name: "Ask local tutor" }).click();
  await expect(page.getByRole("region", { name: "Tutor answer" })).toContainText(/four|4/i, { timeout: 150000 });
  await expect(page.getByRole("button", { name: "Ask local tutor" })).toBeEnabled({ timeout: 150000 });
  await expect(page.getByRole("alert").filter({ hasText: /unavailable|too long|interrupted/ })).toHaveCount(0);
});

test("actual local model generates validated unpublished drafts for all question types", async ({ page }) => {
  test.skip(!realModel, "Requires installed Ollama model; mocks cannot satisfy this test.");
  test.setTimeout(420000);
  expect((await page.request.post("/api/auth/sign-in/email", { headers: { origin }, data: { email: email("teacher"), password } })).ok()).toBe(true);
  await page.goto("/dashboard/teacher/practice-drafts");
  await page.getByLabel("Lesson", { exact: true }).selectOption(lessonId);
  for (const kind of ["SINGLE_CHOICE", "MULTIPLE_SELECT", "SHORT_ANSWER"]) {
    await page.getByLabel(/Question type/).selectOption(kind);
    const completion = page.waitForResponse(response => response.url().endsWith("/api/local-ai/practice-drafts") && response.request().method() === "POST", { timeout: 150000 });
    await page.getByRole("button", { name: "Generate review draft" }).click();
    const response = await completion;
    expect(response.ok()).toBe(true);
    const result = await response.json();
    expect(result).toMatchObject({ status: "draft", reviewRequired: true, published: false, draft: { kind } });
    await expect(page.getByRole("region", { name: "Practice draft" })).toContainText("Unapproved practice draft");
    await expect(page.getByText("Teacher review required. No assessment has been published.")).toBeVisible();
  }
});
