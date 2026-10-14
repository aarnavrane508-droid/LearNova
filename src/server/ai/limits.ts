import "server-only";
import { LocalAiError } from "@/server/ai/contracts";

// Shared across provider instances/hot reloads in this single local Node process.
const runtime = globalThis as typeof globalThis & {
  learnovaAiLimits?: { active: boolean; users: Map<string, { count: number; resetAt: number }> };
};
const state = runtime.learnovaAiLimits ??= { active: false, users: new Map() };

export function acquireInference(): () => void {
  if (state.active) throw new LocalAiError("busy", "The local model is busy. Try again shortly.");
  state.active = true;
  return () => { state.active = false; };
}

export function consumeAiQuota(userId: string, now = Date.now()): void {
  for (const [id, window] of state.users) if (window.resetAt <= now) state.users.delete(id);
  const window = state.users.get(userId) ?? { count: 0, resetAt: now + 60000 };
  if (window.count >= 6 || (!state.users.has(userId) && state.users.size >= 10000)) {
    throw new LocalAiError("rate-limit", "Too many AI requests. Wait a minute before retrying.");
  }
  window.count++;
  state.users.set(userId, window);
}
