import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const notification = await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { readAt: new Date() },
    });

    if (notification.count === 0) return apiError("Notification not found.", 404);
    return apiOk({ markedRead: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return apiError("Unauthorized.", 401);
    return apiError("Could not update notification.", 500);
  }
}
