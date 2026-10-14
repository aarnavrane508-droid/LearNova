import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { readAiInput, aiErrorResponse } from "@/server/ai/http";

it("caps request bodies even when Content-Length is absent", async () => {
  const request = new Request("http://localhost/api/local-ai/tutor", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "x".repeat(12001) }),
  });
  expect(request.headers.has("content-length")).toBe(false);
  try { await readAiInput(request); throw new Error("Expected oversized body rejection"); }
  catch (error) { expect(aiErrorResponse(error).status).toBe(413); }
});

it("returns a bad-input error for empty JSON rather than blaming the model", async () => {
  const request = new Request("http://localhost/api/local-ai/tutor", { method: "POST", headers: { "Content-Type": "application/json" } });
  await expect(readAiInput(request)).rejects.toBeInstanceOf(SyntaxError);
});
