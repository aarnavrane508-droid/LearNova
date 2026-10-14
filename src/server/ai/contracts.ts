import "server-only";
import type { z } from "zod";

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };
export type AiRequest = { messages: AiMessage[]; signal?: AbortSignal };
export type AiAvailability = { available: boolean; reason: "ready" | "disabled" | "unavailable" | "model-missing" };

export interface AiProvider {
  availability(signal?: AbortSignal): Promise<AiAvailability>;
  chat(request: AiRequest): Promise<string>;
  stream(request: AiRequest): AsyncGenerator<string>;
  explain(text: string, signal?: AbortSignal): Promise<string>;
  summarize(text: string, signal?: AbortSignal): Promise<string>;
  structured<T>(request: AiRequest, schema: z.ZodType<T>): Promise<T>;
}

export class LocalAiError extends Error {
  constructor(public readonly code: "disabled" | "configuration" | "unavailable" | "busy" | "timeout" | "cancelled" | "invalid-output" | "input-limit" | "rate-limit", message: string) {
    super(message);
    this.name = "LocalAiError";
  }
}
