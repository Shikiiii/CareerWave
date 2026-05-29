"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Filter, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-blue-100 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function SelectWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">▼</span>
    </div>
  );
}

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function submit(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());

    formData.forEach((value, key) => {
      const cleanValue = String(value || "").trim();

      if (cleanValue) {
        params.set(key, cleanValue);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <form
      action={submit}
      className="rounded-3xl border border-blue-100 bg-white/95 p-5 shadow-xl shadow-blue-100/60"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Filter className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-bold text-slate-950">Find jobs tailored to you</h2>
          <p className="text-sm text-slate-500">Search by role, location, work model, and salary.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Keyword</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={searchParams.get("q") || ""}
            placeholder="Job title or keyword"
            className={`${inputClass} pl-10`}
          />
        </label>

        <label className="relative">
          <span className="sr-only">Location</span>
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="location"
            defaultValue={searchParams.get("location") || ""}
            placeholder="Location"
            className={`${inputClass} pl-10`}
          />
        </label>

        <SelectWrapper>
          <select name="employmentType" defaultValue={searchParams.get("employmentType") || ""} className={selectClass}>
            <option value="">Any contract</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </SelectWrapper>

        <SelectWrapper>
          <select name="remoteType" defaultValue={searchParams.get("remoteType") || ""} className={selectClass}>
            <option value="">Any work model</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-site</option>
          </select>
        </SelectWrapper>

        <SelectWrapper>
          <select name="sort" defaultValue={searchParams.get("sort") || "newest"} className={selectClass}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="salary_high">Highest salary</option>
            <option value="salary_low">Lowest salary</option>
          </select>
        </SelectWrapper>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <input
          name="company"
          defaultValue={searchParams.get("company") || ""}
          placeholder="Company"
          className={inputClass}
        />

        <SelectWrapper>
          <select name="experienceLevel" defaultValue={searchParams.get("experienceLevel") || ""} className={selectClass}>
            <option value="">Any experience</option>
            <option value="INTERN">Intern</option>
            <option value="JUNIOR">Junior</option>
            <option value="MID">Mid-level</option>
            <option value="SENIOR">Senior</option>
            <option value="LEAD">Lead</option>
            <option value="MANAGER">Manager</option>
          </select>
        </SelectWrapper>

        <input
          name="salaryMin"
          defaultValue={searchParams.get("salaryMin") || ""}
          inputMode="numeric"
          placeholder="Minimum salary"
          className={inputClass}
        />

        <Button className="h-11 rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700">
          <BriefcaseBusiness className="mr-2 h-4 w-4" />
          Search jobs
        </Button>
      </div>
    </form>
  );
}
