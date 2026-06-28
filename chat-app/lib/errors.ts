import type { ApiError } from "@/types/chat";

export function errorResponse(
  error: string,
  code: ApiError["code"],
  status: number
): Response {
  return Response.json({ error, code } satisfies ApiError, { status });
}

export function unauthorized() {
  return errorResponse("Unauthorized", "UNAUTHENTICATED", 401);
}

export function forbidden() {
  return errorResponse("Forbidden", "FORBIDDEN", 403);
}

export function notFound(resource = "Resource") {
  return errorResponse(`${resource} not found`, "NOT_FOUND", 404);
}

export function validationError(message: string) {
  return errorResponse(message, "VALIDATION_ERROR", 422);
}

export function internalError(message = "Internal server error") {
  return errorResponse(message, "INTERNAL", 500);
}
