import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Euro,
  Eye,
  MapPin,
  RadioTower,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPostedDate, formatSalary, humanizeJobValue } from "@/lib/jobs/salary";

export function JobCard({ job, featured = false }: { job: any; featured?: boolean }) {
  const company = job.employer?.companyProfile;
  const postedAt = job.createdAt;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={cn(
        "group relative grid min-h-[230px] overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-100/60 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 xl:grid-cols-[1fr_240px]",
        featured && "bg-gradient-to-br from-white via-blue-50/70 to-white",
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
          <span>Posted {formatPostedDate(postedAt)}</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-600">{company?.companyName || "CareerWave employer"}</p>
            <h3 className="line-clamp-2 text-xl font-extrabold tracking-tight text-slate-950 group-hover:text-blue-700">
              {job.title}
            </h3>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <Info icon={<MapPin className="h-4 w-4" />} text={job.location} />
          <Info icon={<RadioTower className="h-4 w-4" />} text={humanizeJobValue(job.remoteType)} />
          <Info icon={<BriefcaseBusiness className="h-4 w-4" />} text={`${humanizeJobValue(job.employmentType)} · ${humanizeJobValue(job.experienceLevel)}`} />
          <Info icon={<Eye className="h-4 w-4" />} text={`${job.viewCount ?? 0} views`} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 pb-6">
          <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">{humanizeJobValue(job.remoteType)}</Badge>
          <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{humanizeJobValue(job.experienceLevel)}</Badge>
          {job.salaryTaxType && job.salaryTaxType !== "UNSPECIFIED" ? (
            <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700">{humanizeJobValue(job.salaryTaxType)}</Badge>
          ) : null}
        </div>

        <div className="mt-1 border-t border-blue-100 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-950">
              <Euro className="h-4 w-4 text-blue-600" />
              {formatSalary(job)}
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
              View <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>

      <aside className="border-t border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-5 sm:p-6 xl:border-l xl:border-t-0">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            {company?.logoUrl ? (
              <Image src={company.logoUrl} alt={`${company.companyName || "Company"} logo`} fill className="bg-white object-contain p-1.5" unoptimized />
            ) : (
              <Building2 className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-bold text-slate-950">{company?.companyName || "Company profile"}</p>
            <p className="mt-1 text-sm text-slate-500">{company?.industry || "Hiring company"}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-600">
          {company?.employeeCount ? <Info icon={<UsersRound className="h-4 w-4" />} text={`${company.employeeCount} employees`} /> : null}
          {company?.location ? <Info icon={<MapPin className="h-4 w-4" />} text={company.location} /> : null}
          <Info icon={<BriefcaseBusiness className="h-4 w-4" />} text={`${job._count?.applications ?? job.applications?.length ?? 0} applicants`} />
        </div>
      </aside>
    </Link>
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
