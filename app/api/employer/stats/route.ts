import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/employer/access";
import { apiError, apiOk } from "@/lib/api-response";

export async function GET() {
  try {
    const { employer } = await requireEmployer();

    const [activeJobs, pausedJobs, closedJobs, totalJobs, totalApplicants, acceptedApplicants, rejectedApplicants, recentJobs] = await Promise.all([
      prisma.jobListing.count({ where: { employerId: employer.id, status: "ACTIVE" } }),
      prisma.jobListing.count({ where: { employerId: employer.id, status: "PAUSED" } }),
      prisma.jobListing.count({ where: { employerId: employer.id, status: "CLOSED" } }),
      prisma.jobListing.count({ where: { employerId: employer.id, status: { not: "DELETED" } } }),
      prisma.application.count({ where: { job: { employerId: employer.id } } }),
      prisma.application.count({ where: { job: { employerId: employer.id }, status: "ACCEPTED" } }),
      prisma.application.count({ where: { job: { employerId: employer.id }, status: "REJECTED" } }),
      prisma.jobListing.findMany({
        where: { employerId: employer.id, status: { not: "DELETED" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { applications: true } } },
      }),
    ]);

    return apiOk({
      stats: { activeJobs, pausedJobs, closedJobs, totalJobs, totalApplicants, acceptedApplicants, rejectedApplicants },
      recentJobs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load employer stats";
    return apiError(message, message === "Unauthorized" ? 401 : 403);
  }
}
