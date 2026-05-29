import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const { jobId } = await params;
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_jobId: { userId: user.id, jobId } },
      select: { id: true },
    });
    return apiOk({ saved: Boolean(bookmark) });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not check saved job.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const { jobId } = await params;
    await prisma.bookmark.deleteMany({ where: { userId: user.id, jobId } });
    return apiOk({ deleted: true });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not remove saved job.", 500);
  }
}
