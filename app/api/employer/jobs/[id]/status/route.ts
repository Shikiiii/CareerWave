import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { requireOwnedJob } from "@/lib/employer/access";

const statusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "CLOSED", "DRAFT"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { job } = await requireOwnedJob(id);
    const parsed = statusSchema.safeParse(await request.json());

    if (!parsed.success) return apiError("Invalid status", 422, parsed.error.flatten());

    const updated = await prisma.jobListing.update({
      where: { id: job.id },
      data: {
        status: parsed.data.status,
        publishedAt: parsed.data.status === "ACTIVE" && !job.publishedAt ? new Date() : job.publishedAt,
      },
      include: { _count: { select: { applications: true, bookmarks: true } } },
    });

    return apiOk({ job: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job status";
    return apiError(message, message === "Unauthorized" ? 401 : 404);
  }
}
