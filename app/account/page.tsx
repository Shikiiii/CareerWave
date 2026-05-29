"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardOverview } from "@/components/account/dashboard-overview";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { jobSeekerNavItems } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";

function AccountContent() {
  const { user } = useAuth();
  const name = user?.profile?.fullName ?? user?.email ?? "there";

  return (
    <DashboardShell navItems={jobSeekerNavItems} title="Job seeker">
      <div className="space-y-10">
        <PageHeading eyebrow="Job seeker dashboard" title={`Welcome, ${name}`} description="Track your applications, manage your profile, upload CV files, and save interesting jobs." />
        <DashboardOverview />
      </div>
    </DashboardShell>
  );
}

export default function AccountPage() {
  return <ProtectedRoute roles={["JOB_SEEKER"]}><AccountContent /></ProtectedRoute>;
}
