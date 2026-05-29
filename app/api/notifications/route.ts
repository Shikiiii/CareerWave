import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    const where = {
      userId: user.id,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    return apiOk({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return apiError("Unauthorized.", 401);
    return apiError("Could not load notifications.", 500);
  }
}
