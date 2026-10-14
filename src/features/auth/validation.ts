import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(12).max(128),
  accountType: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
}).strict();

export const profileSchema = z.object({
  bio: z.string().trim().max(1000).nullable(),
  timezone: z.string().max(100).refine((value) => {
    try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; }
    catch { return false; }
  }, "Choose a valid IANA timezone."),
}).strict();

export const courseSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(4000).nullable().optional(),
}).strict();

export const uuidSchema = z.uuid();
