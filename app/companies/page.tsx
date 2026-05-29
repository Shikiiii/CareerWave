import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, UsersRound, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { resolveCompanyLogoUrl } from "@/lib/company-logos";

export default async function CompaniesPage() {
  const companies = await prisma.companyProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
    include: {
      employer: {
        include: {
          jobs: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
      },
    },
  });

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="rounded-3xl border bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            <Building2 className="h-4 w-4" />
            Companies
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Explore employers on CareerWave</h1>
          <p className="mt-4 text-slate-600">Browse company profiles, learn about employers, and open their active job listings.</p>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => {
          const companyLogoUrl = resolveCompanyLogoUrl(company.logoUrl);

          return (
          <Link key={company.id} href={`/companies/${company.id}`} className="group block">
            <Card className="h-full rounded-3xl border-blue-100 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-blue-700">
                    {companyLogoUrl ? (
                      <Image src={companyLogoUrl} alt={`${company.companyName} logo`} fill className="bg-white object-contain p-1.5" unoptimized />
                    ) : (
                      <Building2 className="h-7 w-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 font-bold text-slate-950 group-hover:text-blue-700">{company.companyName}</h2>
                    <p className="mt-1 text-sm text-slate-500">{company.industry || "Company profile"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  {company.location ? <Info icon={<MapPin className="h-4 w-4" />} text={company.location} /> : null}
                  {company.employeeCount ? <Info icon={<UsersRound className="h-4 w-4" />} text={`${company.employeeCount} employees`} /> : null}
                  <Info icon={<Building2 className="h-4 w-4" />} text={`${company.employer.jobs.length} active listings`} />
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                  View profile <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </section>
    </main>
  );
}

function Info({ icon, text }: { icon: ReactNode; text?: string | null }) {
  if (!text) return null;
  return <div className="flex items-center gap-2"><span className="text-blue-600">{icon}</span><span>{text}</span></div>;
}
