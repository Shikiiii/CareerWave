"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { JobForm } from "@/components/employer/job-form";
import { employerNavItems } from "@/config/navigation";

export default function NewEmployerJobPage() {
  return (
    <ProtectedRoute roles={["EMPLOYER"]}>
      <DashboardShell navItems={employerNavItems} title="Employer">
        <PageHeading eyebrow="Job management" title="Create a new listing" description="Publish a clear job offer for CareerWave candidates." />
        <div className="mt-8 max-w-4xl"><JobForm mode="create" /></div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
