import { DocumentType } from "@prisma/client";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireRole(["JOB_SEEKER"]);

    const cvs = await prisma.uploadedDocument.findMany({
      where: {
        userId: user.id,
        type: DocumentType.CV,
        applicationId: null,
      },
      orderBy: [{ isDefaultCv: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        originalName: true,
        fileUrl: true,
        mimeType: true,
        sizeBytes: true,
        isDefaultCv: true,
        createdAt: true,
      },
    });

    return apiOk({ cvs });
  } catch {
    return apiError("Only logged-in job seekers can apply to jobs.", 401);
  }
}
