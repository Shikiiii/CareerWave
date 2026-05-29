import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiOk } from "@/lib/api-response";
import { requireEmployer } from "@/lib/employer/access";
import { employerJobSchema, normalizeSalaryFields } from "@/lib/validation/employer-jobs";
import { createUniqueJobSlug } from "@/lib/jobs/slug";

export async function GET(request: NextRequest) {
  try {
    const { employer } = await requireEmployer();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const jobs = await prisma.jobListing.findMany({
      where: {
        employerId: employer.id,
        status: status && status !== "ALL" ? (status as any) : { not: "DELETED" },
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true, bookmarks: true } } },
    });

    return apiOk({ jobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load jobs";
    return apiError(message, message === "Unauthorized" ? 401 : 403);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employer } = await requireEmployer();
    const body = await request.json();
    const parsed = employerJobSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid job data", 422, parsed.error.flatten());
    }

    const data = parsed.data;
    const salary = normalizeSalaryFields(data);
    const slug = await createUniqueJobSlug(data.title);

    const job = await prisma.jobListing.create({
      data: {
        employerId: employer.id,
        title: data.title,
        slug,
        description: data.description,
        requirements: data.requirements,
        benefits: data.benefits || null,
        location: data.location,
        ...salary,
        currency: data.currency,
        employmentType: data.employmentType,
        remoteType: data.remoteType,
        experienceLevel: data.experienceLevel,
        status: data.status,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        publishedAt: data.status === "ACTIVE" ? new Date() : null,
      },
      include: { _count: { select: { applications: true, bookmarks: true } } },
    });

    return apiOk({ job }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create job";
    return apiError(message, message === "Unauthorized" ? 401 : 403);
  }
}
