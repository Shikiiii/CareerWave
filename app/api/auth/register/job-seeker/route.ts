import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { createAuthenticatedResponse } from "@/lib/auth/handlers";
import { hashPassword } from "@/lib/auth/password";
import { registerJobSeekerSchema } from "@/lib/validation/auth";
import { handleApiError, parseJsonBody, rateLimitOrError } from "@/lib/security/api";
import { authRateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, authRateLimit);
  if (limited) return limited;

  try {
    const body = sanitizeObject(await parseJsonBody(request), 1000);
    const data = registerJobSeekerSchema.parse(body);
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: "JOB_SEEKER",
        profile: {
          create: {
            fullName: data.fullName,
            location: data.location,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return createAuthenticatedResponse(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("An account with this email already exists.", 409);
    }

    return handleApiError(error, "Unable to register job seeker.");
  }
}
