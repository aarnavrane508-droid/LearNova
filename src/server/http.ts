import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthorizationError } from "@/features/auth/policy";

export function privateJson(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) return privateJson({ error: error.message }, error.status);
  if (error instanceof ZodError || error instanceof SyntaxError) return privateJson({ error: "Check the submitted fields." }, 400);
  if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") return privateJson({ error: "A record with those details already exists." }, 409);
    if (error.code === "P2034") return privateJson({ error: "This request conflicted with another change. Please retry." }, 409);
  }
  // Never return connection strings, SQL, tokens, or provider diagnostics.
  return privateJson({ error: "Account services are temporarily unavailable." }, 503);
}

export function assertSameOrigin(request: Request): void {
  const configuredOrigin = process.env.BETTER_AUTH_URL;
  const origin = request.headers.get("origin");
  if (!configuredOrigin || !origin || origin !== new URL(configuredOrigin).origin) {
    throw new AuthorizationError(403, "This request origin is not allowed.");
  }
}
