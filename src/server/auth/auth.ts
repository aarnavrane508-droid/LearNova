import "server-only";
import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { getDb } from "@/server/db";
import { parsePublicRole } from "@/features/auth/policy";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL) {
    throw new Error("Set BETTER_AUTH_SECRET (at least 32 characters) and BETTER_AUTH_URL before using authentication.");
  }
  const origin = new URL(baseURL).origin;
  if (process.env.NODE_ENV === "production" && !origin.startsWith("https://")) {
    // Explicit opt-in supports local production-build browser tests, never remote HTTP.
    const local = ["localhost", "127.0.0.1"].includes(new URL(origin).hostname);
    if (!local || process.env.ALLOW_LOCAL_HTTP_AUTH !== "true") {
      throw new Error("Production authentication requires HTTPS.");
    }
  }

  return betterAuth({
    appName: "LearNova",
    secret,
    baseURL: origin,
    trustedOrigins: [origin],
    database: prismaAdapter(getDb(), { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    user: {
      additionalFields: {
        role: { type: ["STUDENT", "TEACHER", "ADMIN"], input: false, required: false, defaultValue: "STUDENT" },
        accountType: { type: ["STUDENT", "TEACHER"], input: true, returned: false, required: false, defaultValue: "STUDENT" },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const accountType = "accountType" in user ? user.accountType : "STUDENT";
            try {
              const role = parsePublicRole(accountType);
              return { data: { ...user, role, email: user.email.trim().toLowerCase(), name: user.name.trim() } };
            } catch {
              throw new APIError("BAD_REQUEST", { message: "Choose a student or teacher account." });
            }
          },
        },
        update: {
          before: async (user) => {
            if ("role" in user || "accountType" in user) {
              throw new APIError("FORBIDDEN", { message: "Account roles cannot be changed through this endpoint." });
            }
            return { data: user };
          },
        },
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    advanced: {
      database: { generateId: () => randomUUID() },
      useSecureCookies: origin.startsWith("https://"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
    },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  instance ??= createAuth();
  return instance;
}
