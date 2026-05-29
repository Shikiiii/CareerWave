import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export async function requireEmployer() {
  const authUser = await requireRole(["EMPLOYER"]);

  const employer = await prisma.employer.findUnique({
    where: { userId: authUser.id },
    include: { companyProfile: true },
  });

  if (!employer) {
    throw new Error("Employer profile not found");
  }

  return { authUser, employer };
}

export async function requireOwnedJob(jobId: string) {
  const { employer } = await requireEmployer();

  const job = await prisma.jobListing.findFirst({
    where: {
      id: jobId,
      employerId: employer.id,
      status: { not: "DELETED" },
    },
  });

  if (!job) {
    throw new Error("Job listing not found");
  }

  return { employer, job };
}
