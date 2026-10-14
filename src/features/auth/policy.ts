export const roles = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type Role = (typeof roles)[number];
export type PublicRole = Exclude<Role, "ADMIN">;
export type Actor = { id: string; role: Role };
export type CourseAccess = { ownerId: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };

export class AuthorizationError extends Error {
  public readonly status: 401 | 403 | 404;

  constructor(status: 401 | 403 | 404, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthorizationError";
  }
}

export function parsePublicRole(value: unknown): PublicRole {
  if (value !== "STUDENT" && value !== "TEACHER") {
    throw new AuthorizationError(403, "Choose a student or teacher account.");
  }
  return value;
}

export function assertRole(actor: Actor, allowed: readonly Role[]): void {
  if (!allowed.includes(actor.role)) throw new AuthorizationError(403, "This action is not available to your account.");
}

export function assertSelf(actor: Actor, userId: string): void {
  if (actor.id !== userId) throw new AuthorizationError(404, "Profile not found.");
}

export function assertCanManageCourse(actor: Actor, course: CourseAccess): void {
  if (actor.role === "ADMIN") return;
  if (actor.role !== "TEACHER" || course.ownerId !== actor.id) {
    throw new AuthorizationError(404, "Course not found.");
  }
}

export function assertCanReadCourse(actor: Actor, course: CourseAccess, isEnrolled: boolean): void {
  if (actor.role === "ADMIN") return;
  if (actor.role === "TEACHER" && course.ownerId === actor.id) return;
  if (actor.role === "STUDENT" && isEnrolled && course.status === "PUBLISHED") return;
  throw new AuthorizationError(404, "Course not found.");
}

export function assertCanEnroll(actor: Actor, course: CourseAccess, studentId: string): void {
  assertRole(actor, ["STUDENT"]);
  assertSelf(actor, studentId);
  if (course.status !== "PUBLISHED" || course.ownerId === actor.id) {
    throw new AuthorizationError(404, "Course is not available for enrollment.");
  }
}

export function dashboardPath(role: Role): string {
  if (role === "TEACHER") return "/dashboard/teacher";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/student";
}
