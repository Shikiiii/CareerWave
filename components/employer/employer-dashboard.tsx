"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ElementType } from "react";
import { BriefcaseBusiness, CheckCircle2, Clock3, FileText, Plus, UsersRound, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { JobStatusBadge } from "@/components/employer/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employerNavItems } from "@/config/navigation";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

type EmployerStatsResponse = {
  stats: {
    activeJobs: number;
    pausedJobs: number;
    closedJobs: number;
    totalJobs: number;
    totalApplicants: number;
    acceptedApplicants: number;
    rejectedApplicants: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    slug: string;
    location: string;
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "DELETED";
    createdAt: string;
    _count: { applications: number };
  }>;
};

function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: ElementType; description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-blue-700" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-950">{value}</div>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmployerDashboardContent() {
  const [data, setData] = useState<EmployerStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const response = await apiClient.get("/employer/stats");
        setData(response.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load employer dashboard."));
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <DashboardShell navItems={employerNavItems} title="Employer">
      <PageHeading
        eyebrow="Employer dashboard"
        title="Hiring command center"
        description="Track job listings, applicant volume, and current hiring progress from one clean workspace."
        actions={<Button asChild><Link href="/employer/jobs/new"><Plus className="mr-2 h-4 w-4" />Create job</Link></Button>}
      />

      {loading ? <LoadingState label="Loading employer dashboard..." /> : null}
      {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Active jobs" value={data.stats.activeJobs} icon={BriefcaseBusiness} description="Currently visible job ads" />
            <StatCard title="Total applicants" value={data.stats.totalApplicants} icon={UsersRound} description="Across all your listings" />
            <StatCard title="Accepted" value={data.stats.acceptedApplicants} icon={CheckCircle2} description="Moved forward by reviewers" />
            <StatCard title="Rejected" value={data.stats.rejectedApplicants} icon={XCircle} description="Applications not selected" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Recent job listings</CardTitle>
                <CardDescription>Your newest job posts and their applicant counts.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentJobs.length === 0 ? (
                  <EmptyState title="No job listings yet" description="Create your first job listing to start receiving applications." />
                ) : (
                  <div className="space-y-3">
                    {data.recentJobs.map((job) => (
                      <Link key={job.id} href={`/employer/jobs/${job.id}/edit`} className="flex items-center justify-between rounded-2xl border p-4 transition hover:border-blue-200 hover:bg-blue-50/50">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-950">{job.title}</h3>
                            <JobStatusBadge status={job.status} />
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{job.location} · {job._count.applications} applicants</p>
                        </div>
                        <FileText className="h-5 w-5 text-blue-700" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-700 to-sky-500 text-white">
              <CardHeader>
                <Clock3 className="h-8 w-8" />
                <CardTitle>Quick workflow</CardTitle>
                <CardDescription className="text-blue-50">Create listings now. Applicant review arrives in the next project module.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-50">
                <p>1. Publish an active job listing.</p>
                <p>2. Track incoming applicant counts.</p>
                <p>3. Pause or close listings when hiring is complete.</p>
                <Button asChild variant="secondary" className="mt-2 w-full"><Link href="/employer/jobs">Manage jobs</Link></Button>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </DashboardShell>
  );
}

export function EmployerDashboard() {
  return <ProtectedRoute roles={["EMPLOYER"]}><EmployerDashboardContent /></ProtectedRoute>;
}
