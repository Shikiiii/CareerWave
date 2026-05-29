"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, FileText } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatusBadge } from "@/components/account/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: string;
  status: string;
  coverLetter?: string | null;
  submittedAt: string;
  withdrawnAt?: string | null;
  documents: Array<{ id: string; originalName: string; fileUrl: string; type: string }>;
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
    employer: { companyProfile?: { companyName: string } | null };
  };
};

export function ApplicationsList() {
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingWithdraw, setPendingWithdraw] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  async function loadApplications() {
    setLoading(true);
    try {
      const response = await apiClient.get("/account/applications");
      setApplications(response.data.data.applications);
    } catch (err) {
      toast.error("Could not load applications", getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function withdraw() {
    if (!pendingWithdraw) return;
    try {
      setWithdrawing(true);
      await apiClient.patch(`/account/applications/${pendingWithdraw}/withdraw`);
      toast.success("Application withdrawn");
      setPendingWithdraw(null);
      await loadApplications();
    } catch (err) {
      toast.error("Could not withdraw application", getApiErrorMessage(err));
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) return <LoadingState label="Loading applications..." />;

  return (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No applications yet"
          description="Apply to a job and it will appear here with its current status."
          actionLabel="Browse jobs"
          onAction={() => { window.location.href = "/"; }}
        />
      ) : applications.map((application) => {
        const company = application.job.employer.companyProfile?.companyName ?? "Company";
        const canWithdraw = ["SUBMITTED", "REVIEWING"].includes(application.status);
        return (
          <Card key={application.id}>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">
                    <Link href={`/jobs/${application.job.slug}`} className="hover:text-blue-700">{application.job.title}</Link>
                  </CardTitle>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{company} · {application.job.location} · Applied {new Date(application.submittedAt).toLocaleDateString()}</p>
              </div>
              {canWithdraw && <Button variant="outline" size="sm" onClick={() => setPendingWithdraw(application.id)}>Withdraw</Button>}
            </CardHeader>
            <CardContent className="space-y-3">
              {application.coverLetter && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{application.coverLetter}</p>}
              <div className="flex flex-wrap gap-2">
                {application.documents.map((doc) => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700">
                    <FileText className="h-3.5 w-3.5" />{doc.originalName}<Badge variant="outline">{doc.type}</Badge>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <ConfirmDialog
        open={Boolean(pendingWithdraw)}
        onOpenChange={(open) => !open && setPendingWithdraw(null)}
        title="Withdraw this application?"
        description="The employer will see that the application was withdrawn. This action cannot be reversed from the dashboard."
        confirmLabel="Withdraw"
        destructive
        loading={withdrawing}
        onConfirm={withdraw}
      />
    </div>
  );
}
