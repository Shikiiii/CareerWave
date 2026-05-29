import { EmploymentType, ExperienceLevel, JobStatus, Prisma, RemoteType } from "@prisma/client";

export type JobFilterInput = {
  keyword?: string | null;
  location?: string | null;
  employmentType?: EmploymentType | null;
  remoteType?: RemoteType | null;
  experienceLevel?: ExperienceLevel | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employerId?: string | null;
  includeInactive?: boolean;
};

export function buildJobWhere(input: JobFilterInput = {}): Prisma.JobListingWhereInput {
  const and: Prisma.JobListingWhereInput[] = [];

  if (!input.includeInactive) {
    and.push({ status: JobStatus.ACTIVE });
  }

  if (input.keyword) {
    const keyword = input.keyword.trim();
    if (keyword) {
      and.push({
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
          { requirements: { contains: keyword, mode: "insensitive" } },
          {
            employer: {
              companyProfile: {
                companyName: { contains: keyword, mode: "insensitive" },
              },
            },
          },
        ],
      });
    }
  }

  if (input.location) {
    and.push({ location: { contains: input.location.trim(), mode: "insensitive" } });
  }

  if (input.employmentType) and.push({ employmentType: input.employmentType });
  if (input.remoteType) and.push({ remoteType: input.remoteType });
  if (input.experienceLevel) and.push({ experienceLevel: input.experienceLevel });
  if (input.employerId) and.push({ employerId: input.employerId });

  if (typeof input.salaryMin === "number") {
    and.push({ salaryMax: { gte: input.salaryMin } });
  }

  if (typeof input.salaryMax === "number") {
    and.push({ salaryMin: { lte: input.salaryMax } });
  }

  return and.length ? { AND: and } : {};
}
