import { apiError, apiOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const user = await requireAuth();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return apiOk({ markedRead: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return apiError("Unauthorized.", 401);
    return apiError("Could not mark notifications as read.", 500);
  }
}
