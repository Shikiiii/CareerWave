import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { requireEmployer } from "@/lib/employer/access";
import { employerApplicationInclude } from "@/lib/employer/applications";

export async function GET(request: NextRequest) {
  try {
    const { employer } = await requireEmployer();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId") || undefined;
    const status = searchParams.get("status") || undefined;

    const applications = await prisma.application.findMany({
      where: {
        job: {
          employerId: employer.id,
          ...(jobId && jobId !== "ALL" ? { id: jobId } : {}),
        },
        ...(status && status !== "ALL" ? { status: status as any } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: employerApplicationInclude,
    });

    const jobs = await prisma.jobListing.findMany({
      where: { employerId: employer.id, status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, _count: { select: { applications: true } } },
    });

    return apiOk({ applications, jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load applications";
    return apiError(message, message === "Unauthorized" ? 401 : 403);
  }
}
