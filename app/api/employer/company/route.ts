import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api-response";
import { requireEmployer } from "@/lib/employer/access";
import { prisma } from "@/lib/prisma";
import { handleApiError, rateLimitOrError } from "@/lib/security/api";
import { writeRateLimit } from "@/lib/security/rate-limit";
import { sanitizeText } from "@/lib/security/sanitize";
import { saveCompanyLogo } from "@/lib/uploads/images";

export const runtime = "nodejs";

function optionalText(formData: FormData, key: string, maxLength = 500) {
  const raw = formData.get(key);
  if (typeof raw !== "string") return null;
  const value = (sanitizeText(raw, maxLength) as string).trim();
  return value.length ? value : null;
}

export async function GET() {
  try {
    const { authUser, employer } = await requireEmployer();

    return apiOk({
      user: authUser,
      company: employer.companyProfile,
    });
  } catch (error) {
    return handleApiError(error, "Could not load company profile.");
  }
}

export async function PATCH(request: NextRequest) {
  const limited = rateLimitOrError(request, writeRateLimit);
  if (limited) return limited;

  try {
    const { authUser, employer } = await requireEmployer();
    const formData = await request.formData();

    const companyName = optionalText(formData, "companyName", 120);
    const companyEmail = optionalText(formData, "companyEmail", 180) || authUser.email;
    const phone = optionalText(formData, "phone", 40);
    const websiteUrl = optionalText(formData, "websiteUrl", 240);
    const location = optionalText(formData, "location", 120);
    const industry = optionalText(formData, "industry", 120);
    const employeeCount = optionalText(formData, "employeeCount", 80);
    const description = optionalText(formData, "description", 3000);

    if (!companyName) {
      return apiError("Company name is required.", 422);
    }

    if (!companyEmail || !companyEmail.includes("@")) {
      return apiError("A valid company email is required.", 422);
    }

    let logoUrl = employer.companyProfile?.logoUrl ?? null;
    const logo = formData.get("logo");

    if (logo instanceof File && logo.size > 0) {
      const storedLogo = await saveCompanyLogo(logo);
      logoUrl = storedLogo.fileUrl;
    }

    const company = await prisma.companyProfile.upsert({
      where: {
        employerId: employer.id,
      },
      create: {
        employerId: employer.id,
        companyName,
        companyEmail,
        phone,
        websiteUrl,
        location,
        industry,
        employeeCount,
        description,
        logoUrl,
      },
      update: {
        companyName,
        companyEmail,
        phone,
        websiteUrl,
        location,
        industry,
        employeeCount,
        description,
        logoUrl,
      },
    });

    return apiOk({ company });
  } catch (error) {
    return handleApiError(error, "Could not update company profile.");
  }
}
