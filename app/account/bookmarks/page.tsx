"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { BookmarksList } from "@/components/account/bookmarks-list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { jobSeekerNavItems } from "@/config/navigation";

function BookmarksPageContent() {
  return (
    <DashboardShell navItems={jobSeekerNavItems} title="Job seeker">
      <PageHeading eyebrow="Saved jobs" title="Bookmarked jobs" description="A personal shortlist of jobs you may want to apply to later." />
      <BookmarksList />
    </DashboardShell>
  );
}

export default function BookmarksPage() {
  return <ProtectedRoute roles={["JOB_SEEKER"]}><BookmarksPageContent /></ProtectedRoute>;
}
