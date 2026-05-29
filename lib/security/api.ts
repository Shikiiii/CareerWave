import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { apiError } from "@/lib/api-response";
import { checkRateLimit, type RateLimitConfig } from "@/lib/security/rate-limit";

export function rateLimitOrError(request: NextRequest, config: RateLimitConfig) {
  const result = checkRateLimit(request, config);
  if (result.allowed) return null;

  const response = apiError("Too many requests. Please try again soon.", 429);
  response.headers.set("Retry-After", String(Math.ceil((result.resetAt - Date.now()) / 1000)));
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetAt));
  return response;
}

export async function parseJsonBody<T = unknown>(request: NextRequest): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json request body.");
  }
  return (await request.json()) as T;
}

export function handleApiError(error: unknown, fallbackMessage = "Something went wrong.") {
  if (error instanceof ZodError) {
    return apiError("Validation failed.", 422, error.flatten());
  }

  if (error instanceof Error) {
    if (error.message === "Unauthorized") return apiError("You must be logged in.", 401);
    if (error.message === "Forbidden") return apiError("You are not allowed to perform this action.", 403);
  }

  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    return apiError(error.message || fallbackMessage, 500);
  }

  return apiError(fallbackMessage, 500);
}

export function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}
