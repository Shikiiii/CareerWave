import { ApplicationStatus, NotificationType } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const { id } = await params;
    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id },
      include: { job: { include: { employer: true } } },
    });
    if (!existing) return apiError("Application not found.", 404);
    const nonWithdrawableStatuses: ApplicationStatus[] = [
      ApplicationStatus.ACCEPTED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ];

    if (nonWithdrawableStatuses.includes(existing.status)) {
      return apiError("This application can no longer be withdrawn.", 409);
    }

    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { status: ApplicationStatus.WITHDRAWN, withdrawnAt: new Date() },
        include: { job: { select: { title: true, slug: true } } },
      });
      await tx.notification.create({
        data: {
          userId: existing.job.employer.userId,
          type: NotificationType.APPLICATION_WITHDRAWN,
          title: "Application withdrawn",
          message: `${user.email} withdrew an application for ${existing.job.title}.`,
          metadata: { applicationId: id, jobId: existing.jobId },
        },
      });
      return updated;
    });

    return apiOk({ application });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not withdraw application.", 500);
  }
}
