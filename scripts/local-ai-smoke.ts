import { config } from "dotenv";
import { z } from "zod";
import { OllamaProvider } from "../src/server/ai/ollama";

config({ path: ".env.local" });
const provider = new OllamaProvider();
const start = performance.now();
try {
  const status = await provider.availability();
  if (!status.available) throw new Error(`Local model not ready: ${status.reason}`);
  const answer = await provider.chat({ messages: [{ role: "user", content: "What is two plus two? Reply in one short sentence." }] });
  if (!/four|4/i.test(answer)) throw new Error("The real model did not answer the simple arithmetic probe as expected.");
  const structured = await provider.structured({ messages: [{ role: "user", content: "Return JSON with an answer string: what is two plus two?" }] }, z.object({ answer: z.string().min(1).max(100) }).strict());
  console.log(JSON.stringify({ realLocalInference: true, answer, structured, elapsedMs: Math.round(performance.now() - start) }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Local inference verification failed.");
  process.exitCode = 1;
}
