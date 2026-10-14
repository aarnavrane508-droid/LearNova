import { NextResponse } from "next/server";
import { z } from "zod";
import { enrollInCourse, leaveCourse, listCourseEnrollments } from "@/server/services/courses";
import { assertSameOrigin, jsonError, privateJson } from "@/server/http";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: Context) {
  try { const { courseId } = await context.params; return privateJson(await listCourseEnrollments(courseId)); }
  catch (error) { return jsonError(error); }
}

export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    z.object({}).strict().parse(await request.json());
    const { courseId } = await context.params;
    return privateJson(await enrollInCourse(courseId));
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    z.object({}).strict().parse(await request.json());
    const { courseId } = await context.params;
    await leaveCourse(courseId);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return jsonError(error); }
}
