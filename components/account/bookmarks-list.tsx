"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

type Bookmark = {
  id: string;
  jobId: string;
  job: any;
};

export function BookmarksList() {
  const toast = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const response = await apiClient.get("/account/bookmarks");
      setBookmarks(response.data.data.bookmarks);
    } catch (err) {
      toast.error("Could not load saved jobs", getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookmarks();
  }, []);

  async function remove() {
    if (!pendingRemove) return;
    try {
      setRemoving(true);
      await apiClient.delete(`/account/bookmarks/${pendingRemove}`);
      setBookmarks((current) => current.filter((bookmark) => bookmark.jobId !== pendingRemove));
      toast.success("Saved job removed");
      setPendingRemove(null);
    } catch (err) {
      toast.error("Could not remove saved job", getApiErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  }

  if (loading) return <CardGridSkeleton count={4} />;

  return (
    <div className="space-y-4">
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved jobs"
          description="Bookmark jobs you want to revisit later. Saved jobs stay here until you remove them."
          actionLabel="Browse jobs"
          onAction={() => { window.location.href = "/"; }}
        />
      ) : (
        bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="space-y-2">
            <JobCard job={bookmark.job} />
            <div className="flex justify-end gap-2">
              <Button asChild variant="ghost" size="sm"><Link href={`/jobs/${bookmark.job.slug}`}>View job</Link></Button>
              <Button variant="outline" size="sm" onClick={() => setPendingRemove(bookmark.jobId)}>Remove saved job</Button>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove saved job?"
        description="This job will be removed from your bookmarks. You can save it again from the job page."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={remove}
      />
    </div>
  );
}
