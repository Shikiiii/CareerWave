"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit, Eye, PauseCircle, PlayCircle, Plus, Trash2, UsersRound, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { JobStatusBadge } from "@/components/employer/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { employerNavItems } from "@/config/navigation";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { formatSalary } from "@/lib/jobs/salary";

type EmployerJob = {
  id: string;
  title: string;
  slug: string;
  location: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "DELETED";
  employmentType: string;
  remoteType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  salaryDisplayType?: string | null;
  salaryTaxType?: string | null;
  createdAt: string;
  _count: { applications: number; bookmarks: number };
};

function EmployerJobsManagerContent() {
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadJobs() {
    try {
      setLoading(true);
      const response = await apiClient.get(`/employer/jobs?status=${filter}`);
      setJobs(response.data.data.jobs);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load job listings."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, [filter]);

  const counts = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((job) => job.status === "ACTIVE").length,
    paused: jobs.filter((job) => job.status === "PAUSED").length,
  }), [jobs]);

  async function changeStatus(jobId: string, status: string) {
    try {
      setActionId(jobId);
      await apiClient.patch(`/employer/jobs/${jobId}/status`, { status });
      await loadJobs();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update job status."));
    } finally {
      setActionId(null);
    }
  }

  async function deleteJob(jobId: string) {
    if (!window.confirm("Delete this listing? It will be hidden from public browsing.")) return;
    try {
      setActionId(jobId);
      await apiClient.delete(`/employer/jobs/${jobId}`);
      await loadJobs();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete job listing."));
    } finally {
      setActionId(null);
    }
  }

  return (
    <DashboardShell navItems={employerNavItems} title="Employer">
      <PageHeading
        eyebrow="Job management"
        title="Your job listings"
        description="Create, edit, pause, reactivate, close, or delete job listings from one page."
        actions={<Button asChild><Link href="/employer/jobs/new"><Plus className="mr-2 h-4 w-4" />New listing</Link></Button>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Shown now</p><p className="text-3xl font-bold">{counts.total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Active</p><p className="text-3xl font-bold text-emerald-700">{counts.active}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Paused</p><p className="text-3xl font-bold text-amber-700">{counts.paused}</p></CardContent></Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["ALL", "ACTIVE", "PAUSED", "DRAFT", "CLOSED"].map((status) => (
          <Button key={status} size="sm" variant={filter === status ? "default" : "outline"} onClick={() => setFilter(status)}>{status.replaceAll("_", " ")}</Button>
        ))}
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {loading ? <LoadingState label="Loading job listings..." /> : null}

      {!loading && jobs.length === 0 ? (
        <EmptyState title="No listings found" description="Create a job listing or switch filters to view other statuses." />
      ) : null}

      <div className="mt-6 space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{job.title}</h3>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{job.location} · {job.employmentType.replaceAll("_", " ")} · {job.remoteType.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-slate-500">{job._count.applications} applicants · {job._count.bookmarks} saved · {formatSalary(job)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><Link href={`/jobs/${job.slug}`}><Eye className="mr-2 h-4 w-4" />View</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/employer/jobs/${job.id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/employer/jobs/${job.id}/applications`}><UsersRound className="mr-2 h-4 w-4" />Applicants</Link></Button>
                  {job.status === "ACTIVE" ? <Button size="sm" variant="outline" disabled={actionId === job.id} onClick={() => changeStatus(job.id, "PAUSED")}><PauseCircle className="mr-2 h-4 w-4" />Pause</Button> : null}
                  {job.status === "PAUSED" || job.status === "DRAFT" ? <Button size="sm" variant="outline" disabled={actionId === job.id} onClick={() => changeStatus(job.id, "ACTIVE")}><PlayCircle className="mr-2 h-4 w-4" />Reactivate</Button> : null}
                  {job.status !== "CLOSED" ? <Button size="sm" variant="outline" disabled={actionId === job.id} onClick={() => changeStatus(job.id, "CLOSED")}><XCircle className="mr-2 h-4 w-4" />Close</Button> : null}
                  <Button size="sm" variant="destructive" disabled={actionId === job.id} onClick={() => deleteJob(job.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}

export function EmployerJobsManager() {
  return <ProtectedRoute roles={["EMPLOYER"]}><EmployerJobsManagerContent /></ProtectedRoute>;
}
