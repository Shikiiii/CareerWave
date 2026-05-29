import { JobStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { bookmarkSchema } from "@/lib/validation/account";

export async function GET() {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { job: { include: { employer: { include: { companyProfile: true } } } } },
    });
    return apiOk({ bookmarks });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not load saved jobs.", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const parsed = bookmarkSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Invalid bookmark data.", 422, parsed.error.flatten());

    const job = await prisma.jobListing.findFirst({ where: { id: parsed.data.jobId, status: JobStatus.ACTIVE }, select: { id: true } });
    if (!job) return apiError("Job not found.", 404);

    const bookmark = await prisma.bookmark.upsert({
      where: { userId_jobId: { userId: user.id, jobId: parsed.data.jobId } },
      create: { userId: user.id, jobId: parsed.data.jobId },
      update: {},
    });
    return apiOk({ bookmark }, 201);
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not save job.", 500);
  }
}
