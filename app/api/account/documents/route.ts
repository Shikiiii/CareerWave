import { DocumentType } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { saveUploadedDocument, validateApplicationFile } from "@/lib/uploads/documents";
import { handleApiError, rateLimitOrError } from "@/lib/security/api";
import { writeRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const documents = await prisma.uploadedDocument.findMany({
      where: { userId: user.id, applicationId: null },
      orderBy: [{ isDefaultCv: "desc" }, { createdAt: "desc" }],
    });
    return apiOk({ documents });
  } catch (error) {
    return handleApiError(error, "Could not load documents.");
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimitOrError(request, writeRateLimit);
  if (limited) return limited;

  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const formData = await request.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") || "CV") as DocumentType;
    const setDefault = String(formData.get("isDefaultCv") || "false") === "true";

    if (!(file instanceof File) || file.size === 0) return apiError("Please upload a document.", 422);
    if (!Object.values(DocumentType).includes(type)) return apiError("Invalid document type.", 422);
    await validateApplicationFile(file, file.name || "Document");

    const stored = await saveUploadedDocument(file, type === DocumentType.CV ? "profiles/cvs" : "profiles/documents");

    const document = await prisma.$transaction(async (tx) => {
      if (type === DocumentType.CV && setDefault) {
        await tx.uploadedDocument.updateMany({ where: { userId: user.id, type: DocumentType.CV }, data: { isDefaultCv: false } });
      }
      return tx.uploadedDocument.create({
        data: { userId: user.id, type, ...stored, isDefaultCv: type === DocumentType.CV ? setDefault : false },
      });
    });

    return apiOk({ document }, 201);
  } catch (error) {
    return handleApiError(error, "Could not upload document.");
  }
}
