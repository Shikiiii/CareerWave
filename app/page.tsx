import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { EmploymentType, ExperienceLevel, JobStatus, RemoteType } from "@prisma/client";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";

type HomeSearchParams = {
  page?: string;
  q?: string;
  location?: string;
  company?: string;
  salaryMin?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  remoteType?: RemoteType;
  sort?: string;
};

function parsePositiveInt(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;

  const page = Math.max(1, Number(params?.page || 1));
  const limit = 12;
  const salaryMin = parsePositiveInt(params.salaryMin);

  const andFilters: any[] = [];

  if (params.q) {
    andFilters.push({
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { description: { contains: params.q, mode: "insensitive" } },
        { requirements: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }

  if (params.location) {
    andFilters.push({
      location: {
        contains: params.location,
        mode: "insensitive",
      },
    });
  }

  if (params.remoteType) {
    andFilters.push({ remoteType: params.remoteType });
  }

  if (params.employmentType) {
    andFilters.push({ employmentType: params.employmentType });
  }

  if (params.experienceLevel) {
    andFilters.push({ experienceLevel: params.experienceLevel });
  }

  if (salaryMin) {
    andFilters.push({
      OR: [{ salaryMin: { gte: salaryMin } }, { salaryMax: { gte: salaryMin } }],
    });
  }

  if (params.company) {
    andFilters.push({
      employer: {
        companyProfile: {
          is: {
            companyName: {
              contains: params.company,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  const where: any = {
    status: JobStatus.ACTIVE,
    ...(andFilters.length ? { AND: andFilters } : {}),
  };

  const orderBy =
    params.sort === "oldest"
      ? [{ createdAt: "asc" as const }, { id: "asc" as const }]
      : params.sort === "salary_high"
        ? [{ salaryMax: "desc" as const }, { createdAt: "desc" as const }, { id: "desc" as const }]
        : params.sort === "salary_low"
          ? [{ salaryMin: "asc" as const }, { createdAt: "desc" as const }, { id: "desc" as const }]
          : [{ createdAt: "desc" as const }, { id: "desc" as const }];

  const [featured, jobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where: {
        status: JobStatus.ACTIVE,
      },
      take: 3,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        employer: {
          include: {
            companyProfile: true,
          },
        },
        _count: { select: { applications: true, bookmarks: true } },
      },
    }),

    prisma.jobListing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        employer: {
          include: {
            companyProfile: true,
          },
        },
        _count: { select: { applications: true, bookmarks: true } },
      },
    }),

    prisma.jobListing.count({
      where,
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  function createPageUrl(nextPage: number) {
    const nextParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      if (value && key !== "page") {
        nextParams.set(key, String(value));
      }
    });

    nextParams.set("page", String(nextPage));

    return `/?${nextParams.toString()}`;
  }

  return (
    <main className="bg-gradient-to-b from-blue-50/80 via-white to-white">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 p-8 text-white shadow-2xl shadow-blue-200 md:p-12">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-semibold text-blue-50">
              {new Date().getHours() < 12 ? "Good morning" : "Good Afternoon"}
            </p>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Find your next opportunity
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50">
              CareerWave connects talented people with companies looking for their next great hire.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-blue-100" />
              </div>
            </div>
          }
        >
          <JobFilters />
        </Suspense>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Featured</p>
              <h2 className="text-2xl font-bold text-slate-950">Featured jobs</h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Browse</p>
              <h2 className="text-2xl font-bold text-slate-950">Latest jobs</h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {jobs.length} of {total} matching job listings.
              </p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">No jobs found</h3>
              <p className="mt-2 text-sm text-slate-500">Try removing a few filters or searching for a different keyword.</p>
            </div>
          )}

          {pages > 1 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: Math.min(pages, 10) }).map((_, i) => {
                const currentPage = i + 1;

                return (
                  <a
                    key={currentPage}
                    href={createPageUrl(currentPage)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      page === currentPage
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "border border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    {currentPage}
                  </a>
                );
              })}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
