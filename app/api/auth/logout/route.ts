import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiMethodNotAllowed, apiOk } from "@/lib/api-response";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearedAccessCookieOptions,
  clearedRefreshCookieOptions,
} from "@/lib/auth/cookies";
import { hashToken } from "@/lib/auth/tokens";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  const response = apiOk({ loggedOut: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", clearedAccessCookieOptions);
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", clearedRefreshCookieOptions);

  return response;
}

export async function GET() {
  return apiMethodNotAllowed(["POST"]);
}
