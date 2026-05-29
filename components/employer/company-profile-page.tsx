"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Building2, ImagePlus, Loader2, Save } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/shared/page-heading";
import { LoadingState } from "@/components/shared/loading-state";
import { employerNavItems } from "@/config/navigation";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CompanyFormState = {
  companyName: string;
  companyEmail: string;
  phone: string;
  websiteUrl: string;
  location: string;
  industry: string;
  employeeCount: string;
  description: string;
  logoUrl: string;
};

const emptyCompany: CompanyFormState = {
  companyName: "",
  companyEmail: "",
  phone: "",
  websiteUrl: "",
  location: "",
  industry: "",
  employeeCount: "",
  description: "",
  logoUrl: "",
};

function fieldValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function CompanyProfileContent() {
  const [form, setForm] = useState<CompanyFormState>(emptyCompany);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        const response = await apiClient.get("/employer/company");
        const company = response.data.data.company;

        if (company) {
          setForm({
            companyName: fieldValue(company.companyName),
            companyEmail: fieldValue(company.companyEmail),
            phone: fieldValue(company.phone),
            websiteUrl: fieldValue(company.websiteUrl),
            location: fieldValue(company.location),
            industry: fieldValue(company.industry),
            employeeCount: fieldValue(company.employeeCount),
            description: fieldValue(company.description),
            logoUrl: fieldValue(company.logoUrl),
          });
        }
      } catch (error) {
        setMessage({ type: "error", text: getApiErrorMessage(error, "Could not load company profile.") });
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, []);

  useEffect(() => {
    if (!logo) {
      setLogoPreview("");
      return;
    }

    const url = URL.createObjectURL(logo);
    setLogoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [logo]);

  const visibleLogo = useMemo(() => logoPreview || form.logoUrl, [logoPreview, form.logoUrl]);

  function updateField(key: keyof CompanyFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const nextLogo = event.target.files?.[0] ?? null;
    setLogo(nextLogo);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "logoUrl") payload.set(key, value);
      });

      if (logo) payload.set("logo", logo);

      const response = await fetch("/api/employer/company", {
        method: "PATCH",
        body: payload,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Could not update company profile.");
      }

      const company = result.data.company;
      setForm({
        companyName: fieldValue(company.companyName),
        companyEmail: fieldValue(company.companyEmail),
        phone: fieldValue(company.phone),
        websiteUrl: fieldValue(company.websiteUrl),
        location: fieldValue(company.location),
        industry: fieldValue(company.industry),
        employeeCount: fieldValue(company.employeeCount),
        description: fieldValue(company.description),
        logoUrl: fieldValue(company.logoUrl),
      });
      setLogo(null);
      setMessage({ type: "success", text: "Company profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Could not update company profile." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell navItems={employerNavItems} title="Employer">
      <PageHeading
        eyebrow="Company profile"
        title="Edit your company information"
        description="Keep your employer profile complete so job listings look trustworthy and more alive to applicants."
      />

      {loading ? (
        <div className="mt-8">
          <LoadingState label="Loading company profile..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <CardDescription>This information is displayed on your public job listings and company cards.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              {message ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  placeholder="CareerWave Ltd."
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">Company email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={form.companyEmail}
                    onChange={(event) => updateField("companyEmail", event.target.value)}
                    placeholder="hr@company.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+359..." />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input
                    id="websiteUrl"
                    value={form.websiteUrl}
                    onChange={(event) => updateField("websiteUrl", event.target.value)}
                    placeholder="https://company.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Sofia, Bulgaria" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={form.industry} onChange={(event) => updateField("industry", event.target.value)} placeholder="Software, Finance, Retail..." />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="employeeCount">Company size</Label>
                  <Input
                    id="employeeCount"
                    value={form.employeeCount}
                    onChange={(event) => updateField("employeeCount", event.target.value)}
                    placeholder="11-50 employees"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Tell candidates what your company does, your culture, and what makes you different."
                  className="min-h-40"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save company profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-3xl">
            <CardHeader>
              <CardTitle>Company logo</CardTitle>
              <CardDescription>Displayed on job cards to make listings more recognizable.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 p-6 text-center">
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-sm">
                  {visibleLogo ? (
                    <Image src={visibleLogo} alt="Company logo preview" fill className="object-contain p-3" unoptimized />
                  ) : (
                    <Building2 className="h-12 w-12 text-blue-500" />
                  )}
                </div>

                <Label
                  htmlFor="logo"
                  className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload logo
                </Label>
                <Input id="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoChange} className="hidden" />
                <p className="mt-3 text-xs text-slate-500">PNG, JPG, WEBP, or SVG. Max 2MB.</p>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </DashboardShell>
  );
}

export function CompanyProfilePage() {
  return (
    <ProtectedRoute roles={["EMPLOYER"]}>
      <CompanyProfileContent />
    </ProtectedRoute>
  );
}
