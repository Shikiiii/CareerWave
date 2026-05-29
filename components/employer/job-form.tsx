"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";

type JobFormValues = {
  title: string;
  description: string;
  requirements: string;
  benefits?: string | null;
  location: string;
  salaryDisplayType: string;
  salaryTaxType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  employmentType: string;
  remoteType: string;
  experienceLevel: string;
  status: string;
};

type JobFormErrors = Partial<Record<keyof JobFormValues, string[]>>;

const defaultValues: JobFormValues = {
  title: "",
  description: "",
  requirements: "",
  benefits: "",
  location: "",
  salaryDisplayType: "NOT_SPECIFIED",
  salaryTaxType: "UNSPECIFIED",
  salaryMin: null,
  salaryMax: null,
  currency: "EUR",
  employmentType: "FULL_TIME",
  remoteType: "HYBRID",
  experienceLevel: "JUNIOR",
  status: "ACTIVE",
};

export function JobForm({ mode, job }: { mode: "create" | "edit"; job?: Partial<JobFormValues> & { id?: string } }) {
  const router = useRouter();
  const [values, setValues] = useState<JobFormValues>({ ...defaultValues, ...job });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<JobFormErrors>({});

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };

      if (key === "salaryDisplayType" && value === "NOT_SPECIFIED") {
        next.salaryMin = null;
        next.salaryMax = null;
        next.salaryTaxType = "UNSPECIFIED";
      }

      if (key === "salaryDisplayType" && value === "FLAT") {
        next.salaryMax = next.salaryMin;
      }

      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const salaryMin = values.salaryMin ? Number(values.salaryMin) : null;
    const salaryMax = values.salaryDisplayType === "FLAT" ? salaryMin : values.salaryMax ? Number(values.salaryMax) : null;

    const payload = {
      ...values,
      salaryMin,
      salaryMax,
      benefits: values.benefits || null,
      salaryTaxType: values.salaryDisplayType === "NOT_SPECIFIED" ? "UNSPECIFIED" : values.salaryTaxType,
    };

    try {
      if (mode === "create") {
        await apiClient.post("/employer/jobs", payload);
      } else if (job?.id) {
        await apiClient.patch(`/employer/jobs/${job.id}`, payload);
      }
      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const details = err.response?.data?.details as { fieldErrors?: Partial<Record<keyof JobFormValues, string[]>>; formErrors?: string[] } | undefined;

        if (details?.fieldErrors) {
          setFieldErrors(details.fieldErrors);
        }

        const formErrors = details?.formErrors?.filter(Boolean) ?? [];
        if (formErrors.length > 0) {
          setError(formErrors.join(" "));
          return;
        }
      }

      setError(getApiErrorMessage(err, "Could not save job listing."));
    } finally {
      setSubmitting(false);
    }
  }

  const salaryEnabled = values.salaryDisplayType !== "NOT_SPECIFIED";

  return (
    <Card className="rounded-3xl border-blue-100 shadow-sm">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create job listing" : "Edit job listing"}</CardTitle>
        <CardDescription>Fill in clear information so candidates can quickly decide if the role fits them.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" value={values.title} onChange={(e) => update("title", e.target.value)} placeholder="Frontend Developer" required />
              <FieldError errors={fieldErrors.title} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={values.location} onChange={(e) => update("location", e.target.value)} placeholder="Sofia, Bulgaria" required />
              <FieldError errors={fieldErrors.location} />
            </div>

            <SelectField label="Compensation" value={values.salaryDisplayType} onChange={(v) => update("salaryDisplayType", v)} options={[
              ["NOT_SPECIFIED", "Do not specify salary"],
              ["FLAT", "Flat salary"],
              ["RANGE", "Salary range"],
            ]} error={fieldErrors.salaryDisplayType?.[0]} />

            {salaryEnabled ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">{values.salaryDisplayType === "FLAT" ? "Salary amount" : "Salary min"}</Label>
                  <Input id="salaryMin" type="number" value={values.salaryMin ?? ""} onChange={(e) => update("salaryMin", e.target.value ? Number(e.target.value) : null)} placeholder="2500" />
                  <FieldError errors={fieldErrors.salaryMin} />
                </div>

                {values.salaryDisplayType === "RANGE" ? (
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Salary max</Label>
                    <Input id="salaryMax" type="number" value={values.salaryMax ?? ""} onChange={(e) => update("salaryMax", e.target.value ? Number(e.target.value) : null)} placeholder="4300" />
                    <FieldError errors={fieldErrors.salaryMax} />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={values.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} maxLength={3} required />
                  <FieldError errors={fieldErrors.currency} />
                </div>

                <SelectField label="Tax display" value={values.salaryTaxType} onChange={(v) => update("salaryTaxType", v)} options={[
                  ["UNSPECIFIED", "Not specified"],
                  ["NET", "After tax / net"],
                  ["GROSS", "Before tax / gross"],
                ]} error={fieldErrors.salaryTaxType?.[0]} />
              </>
            ) : null}

            <SelectField label="Employment type" value={values.employmentType} onChange={(v) => update("employmentType", v)} options={["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "TEMPORARY"]} error={fieldErrors.employmentType?.[0]} />
            <SelectField label="Remote type" value={values.remoteType} onChange={(v) => update("remoteType", v)} options={["ON_SITE", "HYBRID", "REMOTE"]} error={fieldErrors.remoteType?.[0]} />
            <SelectField label="Experience level" value={values.experienceLevel} onChange={(v) => update("experienceLevel", v)} options={["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD", "MANAGER"]} error={fieldErrors.experienceLevel?.[0]} />
            <SelectField label="Status" value={values.status} onChange={(v) => update("status", v)} options={["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]} error={fieldErrors.status?.[0]} />
          </div>

          <TextareaBlock label="Description" value={values.description} onChange={(v) => update("description", v)} placeholder="Describe the role, responsibilities, and team." error={fieldErrors.description?.[0]} />
          <TextareaBlock label="Requirements" value={values.requirements} onChange={(v) => update("requirements", v)} placeholder="List required skills, experience, and expectations." error={fieldErrors.requirements?.[0]} />
          <TextareaBlock label="Benefits" value={values.benefits ?? ""} onChange={(v) => update("benefits", v)} placeholder="Remote work, learning budget, private healthcare..." optional error={fieldErrors.benefits?.[0]} />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/employer/jobs")}>Cancel</Button>
            <Button type="submit" disabled={submitting}><Save className="mr-2 h-4 w-4" />{submitting ? "Saving..." : "Save job"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | [string, string][];
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => {
          const value = Array.isArray(option) ? option[0] : option;
          const label = Array.isArray(option) ? option[1] : option.replaceAll("_", " ");
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <FieldError errors={error ? [error] : undefined} />
    </div>
  );
}

function TextareaBlock({ label, value, onChange, placeholder, optional, error }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; optional?: boolean; error?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}{optional ? <span className="ml-1 text-slate-400">optional</span> : null}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={6} required={!optional} />
      <FieldError errors={error ? [error] : undefined} />
    </div>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="text-sm text-red-600">{errors[0]}</p>;
}
