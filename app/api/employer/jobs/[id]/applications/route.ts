import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { requireOwnedJob } from "@/lib/employer/access";
import { employerApplicationInclude } from "@/lib/employer/applications";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { job } = await requireOwnedJob(id);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const applications = await prisma.application.findMany({
      where: {
        jobId: job.id,
        ...(status && status !== "ALL" ? { status: status as any } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: employerApplicationInclude,
    });

    return apiOk({ job, applications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load job applications";
    return apiError(message, message === "Unauthorized" ? 401 : 404);
  }
}
