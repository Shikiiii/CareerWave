"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DocumentManager } from "@/components/account/document-manager";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { jobSeekerNavItems } from "@/config/navigation";

function DocumentsPageContent() {
  return (
    <DashboardShell navItems={jobSeekerNavItems} title="Job seeker">
      <PageHeading eyebrow="CV management" title="My CV and documents" description="Upload a default CV and keep extra reusable documents in your profile." />
      <DocumentManager />
    </DashboardShell>
  );
}

export default function DocumentsPage() {
  return <ProtectedRoute roles={["JOB_SEEKER"]}><DocumentsPageContent /></ProtectedRoute>;
}
