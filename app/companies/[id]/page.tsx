import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Globe2, Mail, MapPin, Phone, UsersRound } from "lucide-react";
import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/jobs/job-card";
import { Card, CardContent } from "@/components/ui/card";
import { resolveCompanyLogoUrl } from "@/lib/company-logos";

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: {
      employer: {
        include: {
          jobs: {
            where: { status: JobStatus.ACTIVE },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: {
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
            },
          },
        },
      },
    },
  });

  if (!company) notFound();

  const companyLogoUrl = resolveCompanyLogoUrl(company.logoUrl);

  return (
    <main className="bg-gradient-to-b from-blue-50/80 via-white to-white">
      <section className="border-b border-blue-100">
        <div className="container mx-auto px-4 py-10">
          <div className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl shadow-blue-100/60">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-5">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  {companyLogoUrl ? (
                    <Image src={companyLogoUrl} alt={`${company.companyName} logo`} fill className="bg-white object-contain p-3" unoptimized />
                  ) : (
                    <Building2 className="h-12 w-12" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">Company profile</p>
                  <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{company.companyName}</h1>
                  <p className="mt-3 max-w-3xl text-slate-600">{company.description || "This employer is hiring on CareerWave."}</p>
                </div>
              </div>

              <Link href="/" className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                Browse all jobs
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-slate-600 md:grid-cols-2 lg:grid-cols-4">
              <Info icon={<Building2 className="h-4 w-4" />} text={company.industry} />
              <Info icon={<UsersRound className="h-4 w-4" />} text={company.employeeCount ? `${company.employeeCount} employees` : null} />
              <Info icon={<MapPin className="h-4 w-4" />} text={company.location} />
              <Info icon={<Globe2 className="h-4 w-4" />} text={company.websiteUrl} />
              <Info icon={<Mail className="h-4 w-4" />} text={company.companyEmail} />
              <Info icon={<Phone className="h-4 w-4" />} text={company.phone} />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Open roles</p>
          <h2 className="text-3xl font-bold text-slate-950">{company.employer.jobs.length} active listings</h2>
        </div>

        {company.employer.jobs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {company.employer.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl border-dashed border-blue-200">
            <CardContent className="p-10 text-center">
              <h3 className="text-lg font-bold text-slate-950">No active jobs right now</h3>
              <p className="mt-2 text-sm text-slate-500">Check back later for new openings from this company.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

function Info({ icon, text }: { icon: ReactNode; text?: string | null }) {
  if (!text) return null;
  return <div className="flex items-center gap-2"><span className="text-blue-600">{icon}</span><span>{text}</span></div>;
}
