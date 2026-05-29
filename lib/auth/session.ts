import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/tokens";
import type { AuthRole, AuthUser } from "@/types/auth";

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  try {
    const payload = verifyAccessToken(accessToken);

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentAuthUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireRole(allowedRoles: AuthRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
