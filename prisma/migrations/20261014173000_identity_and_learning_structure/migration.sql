-- Initial PostgreSQL migration, authored for the Prisma schema in this commit.
-- Prisma CLI execution is blocked in the current environment; validate drift on setup.
BEGIN;

CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "LessonKind" AS ENUM ('READING', 'VIDEO');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "role" "Role" NOT NULL DEFAULT 'STUDENT',
  "accountType" TEXT NOT NULL DEFAULT 'STUDENT',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_normalized" CHECK ("email" = lower(btrim("email"))),
  CONSTRAINT "User_accountType_public" CHECK ("accountType" IN ('STUDENT', 'TEACHER'))
);

CREATE TABLE "Profile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "bio" VARCHAR(1000),
  "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Course" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "description" VARCHAR(4000),
  "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "studentId" UUID NOT NULL,
  "courseId" UUID NOT NULL,
  "enrolledAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Module" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "position" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Module_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Module_position_positive" CHECK ("position" > 0)
);

CREATE TABLE "Lesson" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "moduleId" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "position" INTEGER NOT NULL,
  "kind" "LessonKind" NOT NULL DEFAULT 'READING',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Lesson_position_positive" CHECK ("position" > 0)
);

CREATE TABLE "Concept" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" VARCHAR(160) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "description" VARCHAR(2000),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonConcept" (
  "lessonId" UUID NOT NULL,
  "conceptId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "LessonConcept_pkey" PRIMARY KEY ("lessonId", "conceptId")
);

CREATE TABLE "Session" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "token" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "password" TEXT,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ(3),
  "refreshTokenExpiresAt" TIMESTAMPTZ(3),
  "scope" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Verification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL,
  "lastRequest" BIGINT NOT NULL,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_ownerId_status_idx" ON "Course"("ownerId", "status");
CREATE INDEX "Course_status_createdAt_idx" ON "Course"("status", "createdAt");
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");
CREATE INDEX "Enrollment_courseId_createdAt_idx" ON "Enrollment"("courseId", "createdAt");
CREATE UNIQUE INDEX "Module_courseId_position_key" ON "Module"("courseId", "position");
CREATE UNIQUE INDEX "Lesson_moduleId_position_key" ON "Lesson"("moduleId", "position");
CREATE UNIQUE INDEX "Concept_slug_key" ON "Concept"("slug");
CREATE INDEX "LessonConcept_conceptId_idx" ON "LessonConcept"("conceptId");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX "Verification_expiresAt_idx" ON "Verification"("expiresAt");
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonConcept" ADD CONSTRAINT "LessonConcept_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonConcept" ADD CONSTRAINT "LessonConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Provision a profile atomically, including users created through Better Auth.
CREATE FUNCTION create_user_profile() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO "Profile" ("userId", "updatedAt") VALUES (NEW."id", CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$;
CREATE TRIGGER "User_create_profile" AFTER INSERT ON "User" FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- These role invariants protect writes from scripts as well as the application.
CREATE FUNCTION enforce_course_owner_role() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE owner_role "Role";
BEGIN
  SELECT "role" INTO owner_role FROM "User" WHERE "id" = NEW."ownerId" FOR SHARE;
  IF owner_role IS NOT NULL AND owner_role NOT IN ('TEACHER', 'ADMIN') THEN
    RAISE EXCEPTION 'Course owners must be teachers or administrators' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "Course_owner_role" BEFORE INSERT OR UPDATE OF "ownerId" ON "Course" FOR EACH ROW EXECUTE FUNCTION enforce_course_owner_role();

CREATE FUNCTION enforce_enrollment_role() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE student_role "Role";
BEGIN
  SELECT "role" INTO student_role FROM "User" WHERE "id" = NEW."studentId" FOR SHARE;
  IF student_role IS NOT NULL AND student_role <> 'STUDENT' THEN
    RAISE EXCEPTION 'Only students may hold enrollments' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "Enrollment_student_role" BEFORE INSERT OR UPDATE OF "studentId" ON "Enrollment" FOR EACH ROW EXECUTE FUNCTION enforce_enrollment_role();

CREATE FUNCTION enforce_user_role_change() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."role" NOT IN ('TEACHER', 'ADMIN') AND EXISTS (SELECT 1 FROM "Course" WHERE "ownerId" = NEW."id") THEN
    RAISE EXCEPTION 'Transfer owned courses before changing this role' USING ERRCODE = '23514';
  END IF;
  IF NEW."role" <> 'STUDENT' AND EXISTS (SELECT 1 FROM "Enrollment" WHERE "studentId" = NEW."id") THEN
    RAISE EXCEPTION 'Remove enrollments before changing this role' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "User_role_change" BEFORE UPDATE OF "role" ON "User" FOR EACH ROW EXECUTE FUNCTION enforce_user_role_change();

COMMIT;
