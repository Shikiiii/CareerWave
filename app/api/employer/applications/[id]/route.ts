import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { employerApplicationInclude, requireOwnedApplication } from "@/lib/employer/applications";
import { employerApplicationActionSchema, interviewNoteSchema } from "@/lib/validation/employer-applications";
import { handleApiError, parseJsonBody, rateLimitOrError } from "@/lib/security/api";
import { writeRateLimit } from "@/lib/security/rate-limit";
import { sanitizeObject } from "@/lib/security/sanitize";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { application } = await requireOwnedApplication(id);

    if (application.status === "SUBMITTED") {
      const updated = await prisma.application.update({
        where: { id: application.id },
        data: { status: "REVIEWING", reviewedAt: new Date() },
        include: employerApplicationInclude,
      });

      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: "APPLICATION_REVIEWING",
          title: "Application in review",
          message: `Your application for ${application.job.title} is now being reviewed.`,
          metadata: { applicationId: application.id, jobId: application.jobId },
        },
      }).catch(() => null);

      return apiOk({ application: updated });
    }

    return apiOk({ application });
  } catch (error) {
    return handleApiError(error, "Failed to load application");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { application } = await requireOwnedApplication(id);
    const limited = rateLimitOrError(request, writeRateLimit);
    if (limited) return limited;

    const body = sanitizeObject(await parseJsonBody<Record<string, unknown>>(request), 5000);

    if (body.type === "INTERVIEW_NOTE") {
      if (application.status !== "ACCEPTED") {
        return apiError("Interview notes can only be added after accepting an application", 400);
      }

      const parsed = interviewNoteSchema.safeParse(body);
      if (!parsed.success) return apiError("Invalid interview note", 422, parsed.error.flatten());

      const existingNote = await prisma.interviewNote.findFirst({
        where: { applicationId: application.id, employerId: application.job.employerId },
        orderBy: { updatedAt: "desc" },
      });

      const noteData = {
        status: parsed.data.status,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
        notes: parsed.data.notes || null,
      };

      const note = existingNote
        ? await prisma.interviewNote.update({ where: { id: existingNote.id }, data: noteData })
        : await prisma.interviewNote.create({
            data: {
              applicationId: application.id,
              employerId: application.job.employerId,
              ...noteData,
            },
          });

      const refreshed = await prisma.application.findUnique({ where: { id: application.id }, include: employerApplicationInclude });
      return apiOk({ application: refreshed, note });
    }

    const parsed = employerApplicationActionSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid application action", 422, parsed.error.flatten());

    if (application.status === "WITHDRAWN") {
      return apiError("Withdrawn applications cannot be updated", 400);
    }

    const nextStatus = parsed.data.action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        reviewedAt: new Date(),
        ...(nextStatus === "ACCEPTED"
          ? {
              interviewNotes: {
                create: {
                  employerId: application.job.employerId,
                  status: "NOT_SCHEDULED",
                  notes: parsed.data.recruiterNotes || null,
                  contactEmail: application.user.email,
                  contactPhone: application.user.profile?.phone || null,
                },
              },
            }
          : {}),
      },
      include: employerApplicationInclude,
    });

    await prisma.notification.create({
      data: {
        userId: application.userId,
        type: nextStatus === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
        title: nextStatus === "ACCEPTED" ? "Application accepted" : "Application rejected",
        message: nextStatus === "ACCEPTED"
          ? `Your application for ${application.job.title} was accepted. The employer may contact you for an interview.`
          : `Your application for ${application.job.title} was rejected.`,
        metadata: { applicationId: application.id, jobId: application.jobId },
      },
    }).catch(() => null);

    return apiOk({ application: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update application");
  }
}
