import { ApplicationStatus, DocumentType, JobStatus, NotificationType } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/validation/applications";
import { MAX_EXTRA_DOCUMENTS, saveUploadedDocument, validateApplicationFile } from "@/lib/uploads/documents";
import { handleApiError, rateLimitOrError } from "@/lib/security/api";
import { writeRateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";

export const runtime = "nodejs";

function getFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((item): item is File => item instanceof File && item.size > 0);
}

function attachUserToDocumentCreates<T extends Record<string, unknown>>(documents: T[], userId: string) {
  return documents.map((document) => ({
    ...document,
    user: {
      connect: {
        id: userId,
      },
    },
  }));
}

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, writeRateLimit);
  if (limited) return limited;

  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const formData = await request.formData();

    const parsed = createApplicationSchema.safeParse({
      jobId: formData.get("jobId"),
      coverLetter: sanitizeText(String(formData.get("coverLetter") || ""), 5000),
      cvMode: formData.get("cvMode"),
      savedCvId: formData.get("savedCvId") || undefined,
    });

    if (!parsed.success) {
      return apiError("Invalid application data.", 422, parsed.error.flatten());
    }

    const { jobId, coverLetter, cvMode, savedCvId } = parsed.data;

    const job = await prisma.jobListing.findFirst({
      where: {
        id: jobId,
        status: JobStatus.ACTIVE,
      },
      include: {
        employer: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!job) {
      return apiError("This job listing is not available for applications.", 404);
    }

    const duplicate = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
      select: { id: true, status: true },
    });

    if (duplicate && duplicate.status !== ApplicationStatus.WITHDRAWN) {
      return apiError("You have already applied to this job.", 409);
    }

    const extraDocuments = getFiles(formData, "documents");
    if (extraDocuments.length > MAX_EXTRA_DOCUMENTS) {
      return apiError(`You can upload up to ${MAX_EXTRA_DOCUMENTS} extra documents.`, 422);
    }

    const uploadedCv = getFiles(formData, "cv")[0];
    let cvDocumentData:
      | {
          type: DocumentType;
          originalName: string;
          fileName: string;
          fileUrl: string;
          mimeType: string;
          sizeBytes: number;
          isDefaultCv?: boolean;
        }
      | null = null;

    if (cvMode === "saved") {
      if (!savedCvId) {
        return apiError("Please choose a saved CV or upload a new one.", 422);
      }

      const savedCv = await prisma.uploadedDocument.findFirst({
        where: {
          id: savedCvId,
          userId: user.id,
          type: DocumentType.CV,
          applicationId: null,
        },
      });

      if (!savedCv) {
        return apiError("Selected CV was not found.", 404);
      }

      cvDocumentData = {
        type: DocumentType.CV,
        originalName: savedCv.originalName,
        fileName: savedCv.fileName,
        fileUrl: savedCv.fileUrl,
        mimeType: savedCv.mimeType,
        sizeBytes: savedCv.sizeBytes,
        isDefaultCv: false,
      };
    }

    if (cvMode === "upload") {
      if (!uploadedCv) {
        return apiError("Please upload a CV.", 422);
      }

      await validateApplicationFile(uploadedCv, "CV");
      const storedCv = await saveUploadedDocument(uploadedCv, "applications/cvs");
      cvDocumentData = {
        type: DocumentType.CV,
        ...storedCv,
        isDefaultCv: false,
      };
    }

    if (!cvDocumentData) {
      return apiError("A CV is required to apply.", 422);
    }

    for (const file of extraDocuments) {
      await validateApplicationFile(file, file.name || "Document");
    }

    const storedExtraDocuments = await Promise.all(
      extraDocuments.map(async (file) => ({
        type: DocumentType.OTHER,
        ...(await saveUploadedDocument(file, "applications/documents")),
      })),
    );

    const application = await prisma.$transaction(async (tx) => {
      if (duplicate?.status === ApplicationStatus.WITHDRAWN) {
        await tx.uploadedDocument.updateMany({
          where: { applicationId: duplicate.id },
          data: { applicationId: null },
        });

        const updated = await tx.application.update({
          where: { id: duplicate.id },
          data: {
            status: ApplicationStatus.SUBMITTED,
            coverLetter: coverLetter || null,
            submittedAt: new Date(),
            reviewedAt: null,
            withdrawnAt: null,
            documents: {
              create: attachUserToDocumentCreates([cvDocumentData!, ...storedExtraDocuments], user.id),
            },
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
            documents: true,
          },
        });

        return updated;
      }

      const created = await tx.application.create({
        data: {
          userId: user.id,
          jobId,
          coverLetter: coverLetter || null,
          documents: {
            create: attachUserToDocumentCreates([cvDocumentData!, ...storedExtraDocuments], user.id),
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          documents: true,
        },
      });

      await tx.notification.create({
        data: {
          userId: job.employer.userId,
          type: NotificationType.NEW_APPLICANT,
          title: "New applicant",
          message: `${user.email} applied for ${job.title}.`,
          metadata: {
            applicationId: created.id,
            jobId,
          },
        },
      });

      return created;
    });

    return apiOk({ application }, duplicate ? 200 : 201);
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) {
      return apiError("Only logged-in job seekers can apply to jobs.", 401);
    }

    return handleApiError(error, "Could not submit application.");
  }
}
