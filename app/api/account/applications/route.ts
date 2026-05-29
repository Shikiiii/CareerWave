import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
      include: {
        documents: true,
        job: {
          include: {
            employer: { include: { companyProfile: true } },
          },
        },
      },
    });
    return apiOk({ applications });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not load applications.", 500);
  }
}
