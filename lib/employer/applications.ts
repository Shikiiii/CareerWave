import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/employer/access";

export const employerApplicationInclude = {
  user: {
    select: {
      id: true,
      email: true,
      profile: true,
    },
  },
  job: {
    select: {
      id: true,
      title: true,
      slug: true,
      employerId: true,
      location: true,
    },
  },
  documents: {
    orderBy: { createdAt: "desc" as const },
  },
  interviewNotes: {
    orderBy: { updatedAt: "desc" as const },
  },
};

export async function requireOwnedApplication(applicationId: string) {
  const { employer } = await requireEmployer();

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: { employerId: employer.id },
    },
    include: employerApplicationInclude,
  });

  if (!application) {
    throw new Error("Application not found");
  }

  return { employer, application };
}

export async function markApplicationAsReviewing(applicationId: string) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });

  if (!application || application.status !== "SUBMITTED") {
    return application;
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "REVIEWING",
      reviewedAt: new Date(),
    },
  });
}
