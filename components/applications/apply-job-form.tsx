"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

type SavedCv = {
  id: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  isDefaultCv: boolean;
};

type ApplyJobFormProps = {
  jobId: string;
  jobTitle: string;
};

const MAX_FILE_SIZE_MB = 5;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplyJobForm({ jobId, jobTitle }: ApplyJobFormProps) {
  const { user, status } = useAuth();
  const [open, setOpen] = useState(false);
  const [savedCvs, setSavedCvs] = useState<SavedCv[]>([]);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [cvMode, setCvMode] = useState<"saved" | "upload">("saved");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isJobSeeker = user?.role === "JOB_SEEKER";

  useEffect(() => {
    if (!open || status === "loading" || status === "idle" || !isJobSeeker) return;

    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setError("");

      try {
        const response = await fetch("/api/applications/options", { credentials: "include" });
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Could not load saved CVs.");
        }

        if (!cancelled) {
          setSavedCvs(result.data.cvs);
          const defaultCv = result.data.cvs.find((cv: SavedCv) => cv.isDefaultCv) ?? result.data.cvs[0];
          if (defaultCv) {
            setSelectedCvId(defaultCv.id);
            setCvMode("saved");
          } else {
            setCvMode("upload");
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load saved CVs.");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [isJobSeeker, open, status]);

  const uploadedDocumentSummary = useMemo(() => {
    if (documents.length === 0) return "No extra documents selected";
    return documents.map((file) => file.name).join(", ");
  }, [documents]);

  function validateFile(file: File) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(file.type)) {
      return "Only PDF, DOC, and DOCX files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Files must be smaller than ${MAX_FILE_SIZE_MB}MB.`;
    }

    return "";
  }

  function handleCvFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");

    if (!file) {
      setCvFile(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setCvFile(null);
      setError(validationError);
      event.target.value = "";
      return;
    }

    setCvFile(file);
  }

  function handleDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setError("");

    if (files.length > 5) {
      setError("You can attach up to 5 extra documents.");
      event.target.value = "";
      return;
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        event.target.value = "";
        return;
      }
    }

    setDocuments(files);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (cvMode === "saved" && !selectedCvId) {
      setError("Please select a saved CV or upload a new CV.");
      return;
    }

    if (cvMode === "upload" && !cvFile) {
      setError("Please upload your CV.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("cvMode", cvMode);
    formData.append("coverLetter", coverLetter);

    if (cvMode === "saved") formData.append("savedCvId", selectedCvId);
    if (cvMode === "upload" && cvFile) formData.append("cv", cvFile);
    documents.forEach((file) => formData.append("documents", file));

    setSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not submit application.");
      }

      setSuccess(true);
      setCoverLetter("");
      setCvFile(null);
      setDocuments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "idle" || status === "loading") {
    return <Button className="w-full" disabled>Loading...</Button>;
  }

  if (!user) {
    return (
      <Button className="w-full" asChild>
        <a href="/login">Log in to apply</a>
      </Button>
    );
  }

  if (!isJobSeeker) {
    return <Button className="w-full" disabled>Employers cannot apply</Button>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">Apply now</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Choose your saved CV or upload a new one. You can also attach extra documents and a short cover letter.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h3 className="mt-3 text-lg font-semibold text-emerald-950">Application submitted</h3>
            <p className="mt-1 text-sm text-emerald-800">
              Your application was sent successfully. You will be able to track its status from your applications page.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button asChild><a href="/account/applications">View applications</a></Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}

            <section className="space-y-3">
              <div>
                <Label>CV</Label>
                <p className="text-sm text-slate-500">A CV is required for every application.</p>
              </div>

              {loadingOptions ? (
                <Card><CardContent className="p-4 text-sm text-slate-500">Loading saved CVs...</CardContent></Card>
              ) : savedCvs.length > 0 ? (
                <div className="grid gap-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-blue-300">
                    <input
                      type="radio"
                      name="cvMode"
                      checked={cvMode === "saved"}
                      onChange={() => setCvMode("saved")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-950">Use saved CV</p>
                      <select
                        value={selectedCvId}
                        onChange={(event) => setSelectedCvId(event.target.value)}
                        disabled={cvMode !== "saved"}
                        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {savedCvs.map((cv) => (
                          <option key={cv.id} value={cv.id}>
                            {cv.originalName} {cv.isDefaultCv ? "(default)" : ""} - {formatFileSize(cv.sizeBytes)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-blue-300">
                    <input
                      type="radio"
                      name="cvMode"
                      checked={cvMode === "upload"}
                      onChange={() => setCvMode("upload")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-950">Upload a new CV for this application</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvFile}
                        disabled={cvMode !== "upload"}
                        className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {cvFile ? <p className="mt-2 text-xs text-slate-500">Selected: {cvFile.name}</p> : null}
                    </div>
                  </label>
                </div>
              ) : (
                <label className="block rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-5">
                  <div className="flex items-center gap-3">
                    <UploadCloud className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-950">Upload your CV</p>
                      <p className="text-sm text-slate-500">PDF, DOC, or DOCX. Maximum 5MB.</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => {
                      setCvMode("upload");
                      handleCvFile(event);
                    }}
                    className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                  />
                  {cvFile ? <p className="mt-2 text-xs text-slate-500">Selected: {cvFile.name}</p> : null}
                </label>
              )}
            </section>

            <section className="space-y-2">
              <Label htmlFor="documents">Extra documents</Label>
              <input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocuments}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              />
              <p className="flex items-center gap-2 text-xs text-slate-500"><FileText className="h-3.5 w-3.5" />{uploadedDocumentSummary}</p>
            </section>

            <section className="space-y-2">
              <Label htmlFor="coverLetter">Cover letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                placeholder="Briefly explain why you are a good fit for this role..."
                rows={6}
                maxLength={5000}
              />
              <p className="text-right text-xs text-slate-500">{coverLetter.length}/5000</p>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit application
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
