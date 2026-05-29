"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ApplicationsList } from "@/components/account/applications-list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { jobSeekerNavItems } from "@/config/navigation";

function ApplicationsPageContent() {
  return (
    <DashboardShell navItems={jobSeekerNavItems} title="Job seeker">
      <PageHeading eyebrow="Applications" title="My applications" description="Review every application you submitted, follow its status, and withdraw active applications if needed." />
      <ApplicationsList />
    </DashboardShell>
  );
}

export default function ApplicationsPage() {
  return <ProtectedRoute roles={["JOB_SEEKER"]}><ApplicationsPageContent /></ProtectedRoute>;
}
