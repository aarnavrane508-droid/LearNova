import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth/auth";
import { registrationSchema } from "@/features/auth/validation";
import { jsonError } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (new URL(request.url).pathname !== "/api/auth/get-session") return new NextResponse(null, { status: 404 });
  try {
    const response = await toNextJsHandler(getAuth()).GET(request);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  if (!["/api/auth/sign-up/email", "/api/auth/sign-in/email", "/api/auth/sign-out"].includes(path)) {
    return new NextResponse(null, { status: 404 });
  }
  try {
    // Validate signup at the HTTP boundary. Public role, userId, and verified flags
    // cannot be smuggled into Better Auth via alternate API callers.
    if (path === "/api/auth/sign-up/email") registrationSchema.parse(await request.clone().json());
    return await toNextJsHandler(getAuth()).POST(request);
  } catch (error) { return jsonError(error); }
}
