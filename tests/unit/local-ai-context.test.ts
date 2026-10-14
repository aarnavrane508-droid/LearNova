import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), findFirst: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/server/db", () => ({ getDb: () => ({ lesson: { findFirst: mocks.findFirst } }) }));
import { getAiLessonContext } from "@/server/ai/lesson-context";
import { prepareTutor } from "@/server/ai/learning";
const lessonId = "b79a50ca-16f9-4b93-b47a-4b9332f05b1f";
beforeEach(() => { vi.clearAllMocks(); mocks.requireRole.mockResolvedValue({ id: "current-user" }); });

it("scopes student material reads to their own published enrolled courses", async () => {
  mocks.findFirst.mockResolvedValue({ id: lessonId, title: "Example", concepts: [] });
  await getAiLessonContext(lessonId, "STUDENT");
  expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: lessonId, module: { course: { status: "PUBLISHED", enrollments: { some: { studentId: "current-user" } } } } } }));
});
it("scopes teacher material reads to the current owner", async () => {
  mocks.findFirst.mockResolvedValue({ id: lessonId, title: "Example", concepts: [] });
  await getAiLessonContext(lessonId, "TEACHER");
  expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: lessonId, module: { course: { ownerId: "current-user" } } } }));
});
it("returns not found for inaccessible materials", async () => {
  mocks.findFirst.mockResolvedValue(null);
  await expect(getAiLessonContext(lessonId, "STUDENT")).rejects.toMatchObject({ status: 404 });
});
it("returns an honest no-context state without requesting inference", async () => {
  mocks.findFirst.mockResolvedValue({ id: lessonId, title: "Example", concepts: [] });
  const result = await prepareTutor({ lessonId, question: "Help me understand" }, new AbortController().signal);
  expect(result.stream).toBeNull(); expect(result.context.sources).toEqual([]);
});
