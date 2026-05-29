"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Download, Eye, FileText, Mail, Phone, UserRound, XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ApplicationStatusBadge } from "@/components/account/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { employerNavItems } from "@/config/navigation";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

const statuses = ["ALL", "SUBMITTED", "REVIEWING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

type ApplicationStatus = "SUBMITTED" | "REVIEWING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type EmployerJobOption = {
  id: string;
  title: string;
  status: string;
  _count: { applications: number };
};

type UploadedDocument = {
  id: string;
  type: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  isDefaultCv: boolean;
  createdAt: string;
};

type InterviewNote = {
  id: string;
  status: "NOT_SCHEDULED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  scheduledAt?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  notes?: string | null;
  updatedAt: string;
};

type EmployerApplication = {
  id: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      phone?: string | null;
      location?: string | null;
      headline?: string | null;
      bio?: string | null;
      skills: string[];
      education?: unknown;
      workExperience?: unknown;
    } | null;
  };
  job: {
    id: string;
    title: string;
    slug: string;
    location: string;
  };
  documents: UploadedDocument[];
  interviewNotes: InterviewNote[];
};

function ApplicantManagementContent() {
  const [applications, setApplications] = useState<EmployerApplication[]>([]);
  const [jobs, setJobs] = useState<EmployerJobOption[]>([]);
  const [jobId, setJobId] = useState("ALL");
  const [status, setStatus] = useState<(typeof statuses)[number]>("ALL");
  const [selected, setSelected] = useState<EmployerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ status: "NOT_SCHEDULED", scheduledAt: "", contactEmail: "", contactPhone: "", notes: "" });

  async function loadApplications() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/employer/applications?jobId=${jobId}&status=${status}`);
      setApplications(response.data.data.applications);
      setJobs(response.data.data.jobs);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load applicants."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApplications(); }, [jobId, status]);

  const stats = useMemo(() => ({
    all: applications.length,
    submitted: applications.filter((app) => app.status === "SUBMITTED").length,
    reviewing: applications.filter((app) => app.status === "REVIEWING").length,
    accepted: applications.filter((app) => app.status === "ACCEPTED").length,
  }), [applications]);

  async function openApplication(application: EmployerApplication) {
    try {
      setActionLoading(true);
      const response = await apiClient.get(`/employer/applications/${application.id}`);
      const fresh = response.data.data.application;
      setSelected(fresh);
      const latestNote = fresh.interviewNotes?.[0];
      setNoteForm({
        status: latestNote?.status || "NOT_SCHEDULED",
        scheduledAt: latestNote?.scheduledAt ? latestNote.scheduledAt.slice(0, 16) : "",
        contactEmail: latestNote?.contactEmail || fresh.user.email || "",
        contactPhone: latestNote?.contactPhone || fresh.user.profile?.phone || "",
        notes: latestNote?.notes || "",
      });
      await loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to open application."));
    } finally {
      setActionLoading(false);
    }
  }

  async function decide(action: "ACCEPT" | "REJECT") {
    if (!selected) return;
    try {
      setActionLoading(true);
      const response = await apiClient.patch(`/employer/applications/${selected.id}`, { action, recruiterNotes: noteForm.notes });
      setSelected(response.data.data.application);
      await loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update application."));
    } finally {
      setActionLoading(false);
    }
  }

  async function saveInterviewNote() {
    if (!selected) return;
    try {
      setActionLoading(true);
      const scheduledAt = noteForm.scheduledAt ? new Date(noteForm.scheduledAt).toISOString() : "";
      const response = await apiClient.patch(`/employer/applications/${selected.id}`, {
        type: "INTERVIEW_NOTE",
        ...noteForm,
        scheduledAt,
      });
      setSelected(response.data.data.application);
      await loadApplications();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save interview notes."));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <ProtectedRoute roles={["EMPLOYER"]}>
      <DashboardShell navItems={employerNavItems} title="Employer">
        <PageHeading
          eyebrow="Applicant management"
          title="Review applications"
          description="Open applicants, review their documents, accept or reject them, and track interview contact notes."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <StatCard label="Visible" value={stats.all} />
          <StatCard label="Submitted" value={stats.submitted} />
          <StatCard label="Reviewing" value={stats.reviewing} />
          <StatCard label="Accepted" value={stats.accepted} />
        </div>

        <Card className="mt-6">
          <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="job-filter">Job listing</Label>
              <select
                id="job-filter"
                value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="ALL">All job listings</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title} ({job._count.applications})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((item) => (
                  <Button key={item} size="sm" variant={status === item ? "default" : "outline"} onClick={() => setStatus(item)}>
                    {item.replaceAll("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        {loading ? <LoadingState label="Loading applicants..." /> : null}
        {!loading && applications.length === 0 ? <EmptyState title="No applicants found" description="Try a different job or status filter." /> : null}

        <div className="mt-6 grid gap-4">
          {applications.map((application) => {
            const cv = application.documents.find((document) => document.type === "CV");
            return (
              <Card key={application.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-950">{application.user.profile?.fullName || application.user.email}</h3>
                        <ApplicationStatusBadge status={application.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">Applied for <Link className="font-medium text-blue-700 hover:underline" href={`/jobs/${application.job.slug}`}>{application.job.title}</Link></p>
                      <p className="mt-1 text-sm text-slate-500">{application.user.profile?.headline || application.user.profile?.location || "No headline provided"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.user.profile?.skills?.slice(0, 5).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cv ? <Button asChild size="sm" variant="outline"><a href={cv.fileUrl} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />CV</a></Button> : null}
                      <Button size="sm" onClick={() => openApplication(application)} disabled={actionLoading}>
                        <Eye className="mr-2 h-4 w-4" />Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            {selected ? (
              <>
                <DialogHeader>
                  <DialogTitle>{selected.user.profile?.fullName || selected.user.email}</DialogTitle>
                  <DialogDescription>{selected.job.title} · submitted {new Date(selected.submittedAt).toLocaleDateString()}</DialogDescription>
                </DialogHeader>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-5">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Applicant profile</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-600">
                        <InfoLine icon={<Mail className="h-4 w-4" />} text={selected.user.email} />
                        {selected.user.profile?.phone ? <InfoLine icon={<Phone className="h-4 w-4" />} text={selected.user.profile.phone} /> : null}
                        {selected.user.profile?.headline ? <InfoLine icon={<UserRound className="h-4 w-4" />} text={selected.user.profile.headline} /> : null}
                        {selected.user.profile?.bio ? <p className="rounded-xl bg-slate-50 p-3 leading-6">{selected.user.profile.bio}</p> : null}
                        <div className="flex flex-wrap gap-2">
                          {selected.user.profile?.skills?.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">Cover letter</CardTitle></CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.coverLetter || "No cover letter was submitted."}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">Documents</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {selected.documents.length === 0 ? <p className="text-sm text-slate-500">No documents attached.</p> : null}
                        {selected.documents.map((document) => (
                          <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border p-3 text-sm transition hover:bg-blue-50">
                            <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 text-blue-700" /><span className="truncate">{document.originalName}</span></span>
                            <span className="text-xs text-slate-500">{document.type} · {formatBytes(document.sizeBytes)}</span>
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-5">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Review decision</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                          <span className="text-sm text-slate-500">Current status</span>
                          <ApplicationStatusBadge status={selected.status} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button disabled={actionLoading || selected.status === "ACCEPTED" || selected.status === "WITHDRAWN"} onClick={() => decide("ACCEPT")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />Accept
                          </Button>
                          <Button variant="destructive" disabled={actionLoading || selected.status === "REJECTED" || selected.status === "WITHDRAWN"} onClick={() => decide("REJECT")}>
                            <XCircle className="mr-2 h-4 w-4" />Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {selected.status === "ACCEPTED" ? (
                      <Card>
                        <CardHeader><CardTitle className="text-lg">Interview and contact notes</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Interview status</Label>
                            <select value={noteForm.status} onChange={(e) => setNoteForm((current) => ({ ...current, status: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                              <option value="NOT_SCHEDULED">Not scheduled</option>
                              <option value="SCHEDULED">Scheduled</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="scheduledAt">Scheduled time</Label>
                            <Input id="scheduledAt" type="datetime-local" value={noteForm.scheduledAt} onChange={(e) => setNoteForm((current) => ({ ...current, scheduledAt: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact email</Label>
                            <Input id="contactEmail" value={noteForm.contactEmail} onChange={(e) => setNoteForm((current) => ({ ...current, contactEmail: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact phone</Label>
                            <Input id="contactPhone" value={noteForm.contactPhone} onChange={(e) => setNoteForm((current) => ({ ...current, contactPhone: e.target.value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Recruiter notes</Label>
                            <Textarea id="notes" rows={5} value={noteForm.notes} onChange={(e) => setNoteForm((current) => ({ ...current, notes: e.target.value }))} />
                          </div>
                          <Button className="w-full" disabled={actionLoading} onClick={saveInterviewNote}>
                            <CalendarClock className="mr-2 h-4 w-4" />Save interview notes
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </DashboardShell>
    </ProtectedRoute>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <Card><CardContent className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold text-slate-950">{value}</p></CardContent></Card>;
}

function InfoLine({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-2">{icon}<span>{text}</span></div>;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function ApplicantManagement() {
  return <ApplicantManagementContent />;
}
