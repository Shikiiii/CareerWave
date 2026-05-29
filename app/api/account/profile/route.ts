import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validation/account";

function parseJsonField(value?: string) {
  if (!value) return null;
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function normalizeEmpty(value?: string | null) {
  return value && value.trim() ? value.trim() : null;
}

export async function GET() {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    return apiOk({ profile });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not load profile.", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole(["JOB_SEEKER"]);
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse({ ...body, skills: Array.isArray(body.skills) ? body.skills : String(body.skills || "").split(",").map((s) => s.trim()).filter(Boolean) });
    if (!parsed.success) return apiError("Invalid profile data.", 422, parsed.error.flatten());

    const data = parsed.data;
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        fullName: data.fullName,
        phone: normalizeEmpty(data.phone),
        location: normalizeEmpty(data.location),
        headline: normalizeEmpty(data.headline),
        bio: normalizeEmpty(data.bio),
        skills: data.skills,
        education: parseJsonField(data.education),
        workExperience: parseJsonField(data.workExperience),
        websiteUrl: normalizeEmpty(data.websiteUrl),
        linkedinUrl: normalizeEmpty(data.linkedinUrl),
        githubUrl: normalizeEmpty(data.githubUrl),
      },
      update: {
        fullName: data.fullName,
        phone: normalizeEmpty(data.phone),
        location: normalizeEmpty(data.location),
        headline: normalizeEmpty(data.headline),
        bio: normalizeEmpty(data.bio),
        skills: data.skills,
        education: parseJsonField(data.education),
        workExperience: parseJsonField(data.workExperience),
        websiteUrl: normalizeEmpty(data.websiteUrl),
        linkedinUrl: normalizeEmpty(data.linkedinUrl),
        githubUrl: normalizeEmpty(data.githubUrl),
      },
    });

    return apiOk({ profile });
  } catch (error) {
    if (error instanceof Error && ["Unauthorized", "Forbidden"].includes(error.message)) return apiError("Unauthorized.", 401);
    return apiError("Could not save profile.", 500);
  }
}
