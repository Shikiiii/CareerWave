import { Prisma } from "@prisma/client";

export const employerWithCompany = Prisma.validator<Prisma.EmployerInclude>()({
  user: { select: { id: true, email: true, role: true, status: true, createdAt: true } },
  companyProfile: true,
});

export const jobListInclude = Prisma.validator<Prisma.JobListingInclude>()({
  employer: {
    include: {
      companyProfile: true,
    },
  },
  _count: {
    select: {
      applications: true,
      bookmarks: true,
    },
  },
});

export const applicationDetailInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  user: {
    include: {
      profile: true,
      documents: true,
    },
  },
  job: {
    include: {
      employer: {
        include: {
          companyProfile: true,
        },
      },
    },
  },
  documents: true,
  interviewNotes: true,
});
