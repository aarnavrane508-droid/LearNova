import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config();

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  const password = process.env.SEED_PASSWORD;
  if (!databaseUrl || !password || password.length < 12 || password.length > 128) {
    throw new Error("Set DATABASE_URL and a development-only SEED_PASSWORD of 12–128 characters.");
  }
  const url = new URL(databaseUrl);
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_SEED !== "true" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !url.pathname.endsWith("_dev")) {
    throw new Error("Seed requires ALLOW_DEV_SEED=true and a local PostgreSQL database ending in _dev.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  try {
    const hashedPassword = await hashPassword(password);
    await prisma.$transaction(async (tx) => {
      const teacher = await tx.user.upsert({
        where: { email: "teacher@example.test" }, update: {},
        create: { name: "Development Teacher", email: "teacher@example.test", role: "TEACHER", accountType: "TEACHER" },
      });
      const student = await tx.user.upsert({
        where: { email: "student@example.test" }, update: {},
        create: { name: "Development Student", email: "student@example.test", role: "STUDENT", accountType: "STUDENT" },
      });
      if (teacher.role !== "TEACHER" || student.role !== "STUDENT") throw new Error("Existing seed users have unexpected roles; no changes applied.");
      for (const user of [teacher, student]) {
        await tx.account.upsert({
          where: { providerId_accountId: { providerId: "credential", accountId: user.id } }, update: {},
          create: { userId: user.id, providerId: "credential", accountId: user.id, password: hashedPassword },
        });
      }
      const course = await tx.course.upsert({
        where: { slug: "development-ecosystems" }, update: {},
        create: { ownerId: teacher.id, title: "Ecosystems — development example", slug: "development-ecosystems", status: "PUBLISHED", description: "Structural seed data only. Learning delivery is a future phase." },
      });
      if (course.ownerId !== teacher.id) throw new Error("Seed course is owned by another user; no changes applied.");
      const courseModule = await tx.module.upsert({
        where: { courseId_position: { courseId: course.id, position: 1 } }, update: {},
        create: { courseId: course.id, position: 1, title: "Connections in nature" },
      });
      const lesson = await tx.lesson.upsert({
        where: { moduleId_position: { moduleId: courseModule.id, position: 1 } }, update: {},
        create: { moduleId: courseModule.id, position: 1, title: "Understanding an ecosystem", kind: "READING" },
      });
      for (const [slug, name] of [["ecosystems", "Ecosystems"], ["interdependence", "Interdependence"]]) {
        const concept = await tx.concept.upsert({ where: { slug }, update: {}, create: { slug, name } });
        await tx.lessonConcept.upsert({
          where: { lessonId_conceptId: { lessonId: lesson.id, conceptId: concept.id } }, update: {},
          create: { lessonId: lesson.id, conceptId: concept.id },
        });
      }
      await tx.enrollment.upsert({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } }, update: {},
        create: { studentId: student.id, courseId: course.id },
      });
    });
    console.log("Development seed completed. No credentials were printed. Existing passwords were preserved.");
  } finally { await prisma.$disconnect(); }
}

seed().catch(() => {
  console.error("Development seed failed. Check local database configuration, migrations, and seed requirements. Connection details are not logged.");
  process.exitCode = 1;
});
