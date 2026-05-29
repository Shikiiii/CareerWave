import { z } from "zod";

const salaryDisplayTypeSchema = z.enum(["NOT_SPECIFIED", "FLAT", "RANGE"]);
const salaryTaxTypeSchema = z.enum(["UNSPECIFIED", "NET", "GROSS"]);

const employerJobBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(30, "Description must be at least 30 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  benefits: z.string().optional().nullable(),
  location: z.string().min(2, "Location is required"),
  salaryDisplayType: salaryDisplayTypeSchema.default("NOT_SPECIFIED"),
  salaryTaxType: salaryTaxTypeSchema.default("UNSPECIFIED"),
  salaryMin: z.coerce.number().int().positive().optional().nullable(),
  salaryMax: z.coerce.number().int().positive().optional().nullable(),
  currency: z.string().min(3).max(3).default("EUR"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "TEMPORARY"]),
  remoteType: z.enum(["ON_SITE", "HYBRID", "REMOTE"]),
  experienceLevel: z.enum(["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER"]),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).default("ACTIVE"),
  expiresAt: z.string().datetime().optional().nullable(),
});

function salaryIsValid(data: {
  salaryDisplayType?: "NOT_SPECIFIED" | "FLAT" | "RANGE";
  salaryMin?: number | null;
  salaryMax?: number | null;
}) {
  if (data.salaryDisplayType === "NOT_SPECIFIED") return true;

  if (data.salaryDisplayType === "FLAT") {
    return Boolean(data.salaryMin || data.salaryMax);
  }

  if (data.salaryDisplayType === "RANGE") {
    return Boolean(data.salaryMin && data.salaryMax && data.salaryMax >= data.salaryMin);
  }

  return true;
}

export const employerJobSchema = employerJobBaseSchema.refine(salaryIsValid, {
  message: "Choose no salary, a flat salary, or a valid min/max salary range.",
  path: ["salaryMax"],
});

export const employerJobUpdateSchema = employerJobBaseSchema.partial().refine(salaryIsValid, {
  message: "Choose no salary, a flat salary, or a valid min/max salary range.",
  path: ["salaryMax"],
});

export type EmployerJobInput = z.infer<typeof employerJobSchema>;

export function normalizeSalaryFields(data: EmployerJobInput | Partial<EmployerJobInput>) {
  const salaryDisplayType = data.salaryDisplayType ?? "NOT_SPECIFIED";

  if (salaryDisplayType === "NOT_SPECIFIED") {
    return {
      salaryDisplayType,
      salaryTaxType: "UNSPECIFIED" as const,
      salaryMin: null,
      salaryMax: null,
    };
  }

  if (salaryDisplayType === "FLAT") {
    const amount = data.salaryMin ?? data.salaryMax ?? null;
    return {
      salaryDisplayType,
      salaryTaxType: data.salaryTaxType ?? "UNSPECIFIED",
      salaryMin: amount,
      salaryMax: amount,
    };
  }

  return {
    salaryDisplayType,
    salaryTaxType: data.salaryTaxType ?? "UNSPECIFIED",
    salaryMin: data.salaryMin ?? null,
    salaryMax: data.salaryMax ?? null,
  };
}
