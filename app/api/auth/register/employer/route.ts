import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import { createAuthenticatedResponse } from "@/lib/auth/handlers";
import { hashPassword } from "@/lib/auth/password";
import { registerEmployerSchema } from "@/lib/validation/auth";
import { handleApiError, parseJsonBody, rateLimitOrError } from "@/lib/security/api";
import { authRateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, authRateLimit);
  if (limited) return limited;

  try {
    const body = sanitizeObject(await parseJsonBody(request), 2000);
    const data = registerEmployerSchema.parse(body);
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.companyEmail,
        passwordHash,
        role: "EMPLOYER",
        employer: {
          create: {
            companyProfile: {
              create: {
                companyName: data.companyName,
                companyEmail: data.companyEmail,
                location: data.location,
                industry: data.industry,
                description: data.description,
              },
            },
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
      return apiError("An employer account with this email already exists.", 409);
    }

    return handleApiError(error, "Unable to register employer.");
  }
}
