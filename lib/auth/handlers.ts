import type { User } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiOk } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "@/lib/auth/cookies";
import { createAccessToken, createRefreshToken } from "@/lib/auth/tokens";
import type { AuthUser } from "@/types/auth";

export function toAuthUser(user: Pick<User, "id" | "email" | "role">): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function createAuthenticatedResponse(user: Pick<User, "id" | "email" | "role">): Promise<NextResponse> {
  const authUser = toAuthUser(user);
  const accessToken = createAccessToken(authUser);
  const refreshToken = createRefreshToken(authUser);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshToken.hash,
      expiresAt: refreshToken.expiresAt,
    },
  });

  const response = apiOk({ user: authUser });
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, accessTokenCookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken.token, refreshTokenCookieOptions);

  return response;
}
