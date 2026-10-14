import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ headers: vi.fn(), getAuth: vi.fn(), getDb: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/auth", () => ({ getAuth: mocks.getAuth }));
vi.mock("@/server/db", () => ({ getDb: mocks.getDb }));

import { getCurrentUser } from "@/server/auth/session";

beforeEach(() => vi.resetAllMocks());

it("does not initialize authentication when request headers suspend prerendering", async () => {
  const suspension = new Error("Request-time rendering required");
  mocks.headers.mockRejectedValue(suspension);
  await expect(getCurrentUser()).rejects.toBe(suspension);
  expect(mocks.getAuth).not.toHaveBeenCalled();
  expect(mocks.getDb).not.toHaveBeenCalled();
});

it("does not read private user data when there is no valid session", async () => {
  mocks.headers.mockResolvedValue(new Headers());
  mocks.getAuth.mockReturnValue({ api: { getSession: vi.fn().mockResolvedValue(null) } });
  await expect(getCurrentUser()).resolves.toBeNull();
  expect(mocks.getDb).not.toHaveBeenCalled();
});

it("authorizes using the current database identity rather than a stale session role", async () => {
  const requestHeaders = new Headers();
  const getSession = vi.fn().mockResolvedValue({ user: { id: "student-id", role: "ADMIN" } });
  const currentUser = { id: "student-id", name: "Student", email: "student@example.test", role: "STUDENT" };
  const findUnique = vi.fn().mockResolvedValue(currentUser);
  mocks.headers.mockResolvedValue(requestHeaders);
  mocks.getAuth.mockReturnValue({ api: { getSession } });
  mocks.getDb.mockReturnValue({ user: { findUnique } });
  await expect(getCurrentUser()).resolves.toEqual(currentUser);
  expect(getSession).toHaveBeenCalledWith({ headers: requestHeaders });
  expect(findUnique).toHaveBeenCalledWith({
    where: { id: "student-id" }, select: { id: true, name: true, email: true, role: true },
  });
});
