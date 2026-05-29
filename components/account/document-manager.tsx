"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FileText, Trash2 } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Document = { id: string; type: string; originalName: string; fileUrl: string; sizeBytes: number; isDefaultCv: boolean; createdAt: string };

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("CV");
  const [isDefaultCv, setIsDefaultCv] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    try {
      const response = await apiClient.get("/account/documents");
      setDocuments(response.data.data.documents);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load documents."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return setError("Please choose a file.");
    setSaving(true); setError(null); setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("isDefaultCv", String(isDefaultCv));
      await apiClient.post("/account/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null); setMessage("Document uploaded.");
      await loadDocuments();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload document."));
    } finally { setSaving(false); }
  }

  async function setDefault(id: string) {
    await apiClient.patch(`/account/documents/${id}`, { action: "set-default-cv" });
    await loadDocuments();
  }

  async function remove(id: string) {
    if (!confirm("Delete this saved document?")) return;
    await apiClient.delete(`/account/documents/${id}`);
    await loadDocuments();
  }

  return (
    <div className="space-y-6">
      {error && <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert>}
      {message && <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">{message}</Alert>}
      <Card>
        <CardHeader><CardTitle>Upload document</CardTitle><CardDescription>Save a default CV for faster job applications.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-4 md:grid-cols-[1fr_180px_160px_auto] md:items-end">
            <div className="space-y-2"><Label>File</Label><Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <div className="space-y-2"><Label>Type</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}><option value="CV">CV</option><option value="COVER_LETTER">Cover letter</option><option value="CERTIFICATE">Certificate</option><option value="PORTFOLIO">Portfolio</option><option value="OTHER">Other</option></select></div>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={isDefaultCv} onChange={(e) => setIsDefaultCv(e.target.checked)} disabled={type !== "CV"} /> Default CV</label>
            <Button disabled={saving}>{saving ? "Uploading..." : "Upload"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Saved documents</CardTitle><CardDescription>Documents here can be reused during applications.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-slate-500">Loading documents...</p> : documents.length === 0 ? <p className="text-sm text-slate-500">No saved documents yet.</p> : documents.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3"><FileText className="mt-1 h-5 w-5 text-blue-700" /><div><div className="flex flex-wrap items-center gap-2"><a href={doc.fileUrl} target="_blank" className="font-medium text-slate-900 hover:text-blue-700">{doc.originalName}</a><Badge variant="outline">{doc.type}</Badge>{doc.isDefaultCv && <Badge variant="success">Default CV</Badge>}</div><p className="text-sm text-slate-500">{formatSize(doc.sizeBytes)} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p></div></div>
              <div className="flex gap-2">{doc.type === "CV" && !doc.isDefaultCv && <Button variant="secondary" size="sm" onClick={() => void setDefault(doc.id)}>Set default</Button>}<Button variant="ghost" size="sm" onClick={() => void remove(doc.id)}><Trash2 className="h-4 w-4" /></Button></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
