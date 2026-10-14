import { createCourse } from "@/server/services/courses";
import { assertSameOrigin, jsonError, privateJson } from "@/server/http";

export async function POST(request: Request) {
  try { assertSameOrigin(request); return privateJson(await createCourse(await request.json()), 201); }
  catch (error) { return jsonError(error); }
}
