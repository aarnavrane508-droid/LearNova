import "server-only";
import { z } from "zod";
import { LocalAiError } from "@/server/ai/contracts";

const configurationSchema = z.object({
  LOCAL_AI_ENABLED: z.enum(["true", "false"]).default("false"),
  LOCAL_AI_BASE_URL: z.string().default("http://127.0.0.1:11434"),
  // Only evaluated local model tags are allowed. Cloud/custom proxy models are rejected.
  LOCAL_AI_MODEL: z.literal("qwen3:1.7b").default("qwen3:1.7b"),
  LOCAL_AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(180000).default(120000),
  LOCAL_AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(32).max(768).default(512),
});

export function readLocalAiConfig(environment: NodeJS.ProcessEnv = process.env) {
  const parsed = configurationSchema.safeParse(environment);
  if (!parsed.success) throw new LocalAiError("configuration", "Local AI configuration is invalid.");
  const value = parsed.data;
  let url: URL;
  try { url = new URL(value.LOCAL_AI_BASE_URL); }
  catch { throw new LocalAiError("configuration", "Local AI must use a loopback HTTP address."); }
  if (url.protocol !== "http:" || !["127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new LocalAiError("configuration", "Local AI must use a loopback HTTP address.");
  }
  return {
    enabled: value.LOCAL_AI_ENABLED === "true", baseUrl: url.origin,
    model: value.LOCAL_AI_MODEL, timeoutMs: value.LOCAL_AI_TIMEOUT_MS,
    maxOutputTokens: value.LOCAL_AI_MAX_OUTPUT_TOKENS, contextTokens: 4096,
  };
}
