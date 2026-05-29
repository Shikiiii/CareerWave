import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { createAuthenticatedResponse } from "@/lib/auth/handlers";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";
import { handleApiError, parseJsonBody, rateLimitOrError } from "@/lib/security/api";
import { authRateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, authRateLimit);
  if (limited) return limited;

  try {
    const body = sanitizeObject(await parseJsonBody(request), 500);
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return apiError("Invalid email or password.", 401);
    }

    const passwordIsValid = await verifyPassword(data.password, user.passwordHash);
    if (!passwordIsValid) {
      return apiError("Invalid email or password.", 401);
    }

    return createAuthenticatedResponse(user);
  } catch (error) {
    return handleApiError(error, "Unable to log in.");
  }
}
