import { Badge } from "@/components/ui/badge";

type JobStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED" | "DELETED";

const config: Record<JobStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  CLOSED: { label: "Closed", variant: "outline" },
  DELETED: { label: "Deleted", variant: "destructive" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const item = config[status] ?? config.DRAFT;
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
