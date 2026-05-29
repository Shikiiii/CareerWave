"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProfileForm } from "@/components/account/profile-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { jobSeekerNavItems } from "@/config/navigation";

function ProfilePageContent() {
  return (
    <DashboardShell navItems={jobSeekerNavItems} title="Job seeker">
      <PageHeading eyebrow="Profile" title="Candidate profile" description="Keep your personal information, skills, education, and work experience ready for employers." />
      <ProfileForm />
    </DashboardShell>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute roles={["JOB_SEEKER"]}><ProfilePageContent /></ProtectedRoute>;
}
