export type SalaryDisplayTypeValue = "NOT_SPECIFIED" | "FLAT" | "RANGE";
export type SalaryTaxTypeValue = "UNSPECIFIED" | "NET" | "GROSS";

export function humanizeJobValue(value?: string | null) {
  if (!value) return "";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSalary(job: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  salaryDisplayType?: SalaryDisplayTypeValue | string | null;
  salaryTaxType?: SalaryTaxTypeValue | string | null;
}) {
  const currency = job.currency || "EUR";
  const taxSuffix =
    job.salaryTaxType === "NET"
      ? " net"
      : job.salaryTaxType === "GROSS"
        ? " gross"
        : "";

  if (job.salaryDisplayType === "NOT_SPECIFIED" || (!job.salaryMin && !job.salaryMax)) {
    return "Salary not specified";
  }

  if (job.salaryDisplayType === "FLAT") {
    const amount = job.salaryMin ?? job.salaryMax;
    return amount ? `${amount.toLocaleString()} ${currency}${taxSuffix}` : "Salary not specified";
  }

  if (job.salaryMin && job.salaryMax) {
    if (job.salaryMin === job.salaryMax) {
      return `${job.salaryMin.toLocaleString()} ${currency}${taxSuffix}`;
    }
    return `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${currency}${taxSuffix}`;
  }

  if (job.salaryMin) return `From ${job.salaryMin.toLocaleString()} ${currency}${taxSuffix}`;
  if (job.salaryMax) return `Up to ${job.salaryMax.toLocaleString()} ${currency}${taxSuffix}`;

  return "Salary not specified";
}

export function formatPostedDate(date?: Date | string | null) {
  if (!date) return "recently";

  const posted = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 31) return `${Math.ceil(diffDays / 7)} weeks ago`;

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(posted);
}
