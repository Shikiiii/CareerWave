import { DocumentType } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (body.action !== "set-default-cv") return apiError("Unsupported document action.", 400);

    const document = await prisma.uploadedDocument.findFirst({ where: { id, userId: user.id, type: DocumentType.CV } });
    if (!document) return apiError("CV document not found.", 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.uploadedDocument.updateMany({ where: { userId: user.id, type: DocumentType.CV }, data: { isDefaultCv: false } });
      return tx.uploadedDocument.update({ where: { id }, data: { isDefaultCv: true } });
    });

    return apiOk({ document: updated });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not update document.", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const { id } = await params;
    const document = await prisma.uploadedDocument.findFirst({ where: { id, userId: user.id, applicationId: null } });
    if (!document) return apiError("Document not found.", 404);
    await prisma.uploadedDocument.delete({ where: { id } });
    return apiOk({ deleted: true });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not delete document.", 500);
  }
}
