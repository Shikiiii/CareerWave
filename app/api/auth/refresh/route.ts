import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth/cookies";
import { createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from "@/lib/auth/tokens";
import type { AuthUser } from "@/types/auth";
import { rateLimitOrError } from "@/lib/security/api";
import { authRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, authRateLimit);
  if (limited) return limited;

  const currentRefreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!currentRefreshToken) {
    return apiError("Missing refresh token.", 401);
  }

  try {
    const payload = verifyRefreshToken(currentRefreshToken);
    const currentHash = hashToken(currentRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: currentHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date() ||
      storedToken.userId !== payload.sub ||
      storedToken.user.status !== "ACTIVE"
    ) {
      if (storedToken?.userId) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      return apiError("Invalid refresh token.", 401);
    }

    const authUser: AuthUser = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const accessToken = createAccessToken(authUser);
    const nextRefreshToken = createRefreshToken(authUser);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          tokenHash: nextRefreshToken.hash,
          expiresAt: nextRefreshToken.expiresAt,
        },
      }),
    ]);

    const response = apiOk({ user: authUser });
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
    response.cookies.set(REFRESH_TOKEN_COOKIE, nextRefreshToken.token, refreshTokenCookieOptions);

    return response;
  } catch {
    return apiError("Invalid refresh token.", 401);
  }
}
