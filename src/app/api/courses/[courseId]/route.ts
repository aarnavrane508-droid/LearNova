import { NextResponse } from "next/server";
import { readCourse, updateCourse } from "@/server/services/courses";
import { assertSameOrigin, jsonError, privateJson } from "@/server/http";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, context: Context) {
  try { const { courseId } = await context.params; return privateJson(await readCourse(courseId)); }
  catch (error) { return jsonError(error); }
}

export async function PATCH(request: Request, context: Context) {
  try { assertSameOrigin(request); const { courseId } = await context.params; await updateCourse(courseId, await request.json()); return new NextResponse(null, { status: 204 }); }
  catch (error) { return jsonError(error); }
}
