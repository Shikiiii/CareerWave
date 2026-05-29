"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { LoadingState } from "@/components/shared/loading-state";
import { JobForm } from "@/components/employer/job-form";
import { employerNavItems } from "@/config/navigation";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string | null;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  salaryDisplayType?: string | null;
  salaryTaxType?: string | null;
  employmentType: string;
  remoteType: string;
  experienceLevel: string;
  status: string;
};

function EditJobContent({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await apiClient.get(`/employer/jobs/${jobId}`);
        setJob(response.data.data.job);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load job listing."));
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  return (
    <DashboardShell navItems={employerNavItems} title="Employer">
      <PageHeading eyebrow="Job management" title="Edit listing" description="Update the public details and status of this job listing." />
      {loading ? <LoadingState label="Loading job listing..." /> : null}
      {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {job ? (
        <div className="mt-8 max-w-4xl">
          <JobForm
            mode="edit"
            job={{
              ...job,
              benefits: job.benefits ?? "",
              salaryDisplayType: job.salaryDisplayType ?? "NOT_SPECIFIED",
              salaryTaxType: job.salaryTaxType ?? "UNSPECIFIED",
              salaryMin: job.salaryMin ?? null,
              salaryMax: job.salaryMax ?? null,
            }}
          />
        </div>
      ) : null}
    </DashboardShell>
  );
}

export function EditJobPage({ jobId }: { jobId: string }) {
  return <ProtectedRoute roles={["EMPLOYER"]}><EditJobContent jobId={jobId} /></ProtectedRoute>;
}
