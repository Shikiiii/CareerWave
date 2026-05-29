import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { requireOwnedJob } from "@/lib/employer/access";
import { employerJobUpdateSchema, normalizeSalaryFields } from "@/lib/validation/employer-jobs";
import { createUniqueJobSlug } from "@/lib/jobs/slug";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { job } = await requireOwnedJob(id);
    return apiOk({ job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load job";
    return apiError(message, message === "Unauthorized" ? 401 : 404);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { job } = await requireOwnedJob(id);
    const body = await request.json();
    const parsed = employerJobUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid job data", 422, parsed.error.flatten());
    }

    const data = parsed.data;
    const salary = normalizeSalaryFields(data);
    const statusGoingActive = data.status === "ACTIVE" && job.status !== "ACTIVE";
    const newSlug = data.title && data.title !== job.title ? await createUniqueJobSlug(data.title) : job.slug;

    const updated = await prisma.jobListing.update({
      where: { id: job.id },
      data: {
        ...("title" in data ? { title: data.title, slug: newSlug } : {}),
        ...("description" in data ? { description: data.description } : {}),
        ...("requirements" in data ? { requirements: data.requirements } : {}),
        ...("benefits" in data ? { benefits: data.benefits || null } : {}),
        ...("location" in data ? { location: data.location } : {}),
        ...("salaryDisplayType" in data || "salaryTaxType" in data || "salaryMin" in data || "salaryMax" in data ? salary : {}),
        ...("currency" in data ? { currency: data.currency } : {}),
        ...("employmentType" in data ? { employmentType: data.employmentType } : {}),
        ...("remoteType" in data ? { remoteType: data.remoteType } : {}),
        ...("experienceLevel" in data ? { experienceLevel: data.experienceLevel } : {}),
        ...("status" in data ? { status: data.status } : {}),
        ...("expiresAt" in data ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } : {}),
        ...(statusGoingActive ? { publishedAt: new Date() } : {}),
      },
      include: { _count: { select: { applications: true, bookmarks: true } } },
    });

    return apiOk({ job: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update job";
    return apiError(message, message === "Unauthorized" ? 401 : 404);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { job } = await requireOwnedJob(id);

    const deleted = await prisma.jobListing.update({
      where: { id: job.id },
      data: { status: "DELETED" },
    });

    return apiOk({ job: deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete job";
    return apiError(message, message === "Unauthorized" ? 401 : 404);
  }
}
