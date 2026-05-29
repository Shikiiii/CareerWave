import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Euro,
  Eye,
  Globe2,
  MapPin,
  RadioTower,
  UsersRound,
} from "lucide-react";
import { JobStatus } from "@prisma/client";
import { ApplyJobForm } from "@/components/applications/apply-job-form";
import { BookmarkButton } from "@/components/account/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatPostedDate, formatSalary, humanizeJobValue } from "@/lib/jobs/salary";
import { resolveCompanyLogoUrl } from "@/lib/company-logos";

function splitLines(value?: string | null) {
  return (value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const job = await prisma.jobListing.findFirst({
    where: {
      slug,
      status: JobStatus.ACTIVE,
    },
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
  });

  if (!job) notFound();

  const updatedJob = await prisma.jobListing.update({
    where: { id: job.id },
    data: { viewCount: { increment: 1 } },
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
  });

  const company = updatedJob.employer.companyProfile;
  const companyLogoUrl = resolveCompanyLogoUrl(company?.logoUrl);
  const requirements = splitLines(updatedJob.requirements);
  const benefits = splitLines(updatedJob.benefits);

  return (
    <main className="bg-gradient-to-b from-blue-50/70 via-white to-white">
      <section className="border-b border-blue-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px] lg:px-6 lg:py-14">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-blue-600">{humanizeJobValue(updatedJob.remoteType)}</Badge>
              <Badge variant="secondary" className="rounded-full">{humanizeJobValue(updatedJob.employmentType)}</Badge>
              <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700">{humanizeJobValue(updatedJob.experienceLevel)}</Badge>
              {updatedJob.salaryTaxType !== "UNSPECIFIED" ? (
                <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700">{humanizeJobValue(updatedJob.salaryTaxType)}</Badge>
              ) : null}
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{updatedJob.title}</h1>

            <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
              <Info icon={<Building2 className="h-4 w-4" />} text={company?.companyName || "CareerWave employer"} />
              <Info icon={<MapPin className="h-4 w-4" />} text={updatedJob.location} />
              <Info icon={<RadioTower className="h-4 w-4" />} text={humanizeJobValue(updatedJob.remoteType)} />
              <Info icon={<CalendarDays className="h-4 w-4" />} text={`Posted ${formatPostedDate(updatedJob.createdAt)}`} />
              <Info icon={<Eye className="h-4 w-4" />} text={`${updatedJob.viewCount.toLocaleString()} listing views`} />
              <Info icon={<BriefcaseBusiness className="h-4 w-4" />} text={`${updatedJob._count.applications} applicants`} />
            </div>
          </div>

          <Card className="rounded-3xl border-blue-100 shadow-xl shadow-blue-100/70">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  {companyLogoUrl ? (
                    <Image src={companyLogoUrl} alt={`${company?.companyName || "Company"} logo`} fill className="bg-white object-contain p-2" unoptimized />
                  ) : (
                    <Building2 className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-950">{company?.companyName || "Company"}</p>
                  <p className="mt-1 text-sm text-slate-500">{company?.industry || "Hiring on CareerWave"}</p>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm text-slate-600">
                <Info icon={<Euro className="h-4 w-4" />} text={formatSalary(updatedJob)} />
                {company?.employeeCount ? <Info icon={<UsersRound className="h-4 w-4" />} text={`${company.employeeCount} employees`} /> : null}
                {company?.location ? <Info icon={<MapPin className="h-4 w-4" />} text={company.location} /> : null}
                {company?.websiteUrl ? <Info icon={<Globe2 className="h-4 w-4" />} text={company.websiteUrl} /> : null}
              </div>

              <div className="mt-6 flex gap-3">
                {company ? (
                  <Link href={`/companies/${company.id}`} className="flex-1 rounded-xl border border-blue-100 px-4 py-2 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50">
                    View company
                  </Link>
                ) : null}
                <BookmarkButton jobId={updatedJob.id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px] lg:px-6">
        <div className="space-y-6">
          <Card className="rounded-3xl border-blue-100">
            <CardHeader>
              <CardTitle>Job description</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none text-slate-700">
              <p className="whitespace-pre-line">{updatedJob.description}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-blue-100">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              {requirements.length > 0 ? (
                <ul className="space-y-3">
                  {requirements.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No separate requirements listed.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-blue-100">
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              {benefits.length > 0 ? (
                <ul className="space-y-3">
                  {benefits.map((item) => (
                    <li key={item} className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No benefits listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ApplyJobForm jobId={updatedJob.id} jobTitle={updatedJob.title} />
        </aside>
      </section>
    </main>
  );
}

function Info({ icon, text }: { icon: ReactNode; text?: string | null }) {
  if (!text) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-blue-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
