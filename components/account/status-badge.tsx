import { Badge } from "@/components/ui/badge";

const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  SUBMITTED: "default",
  REVIEWING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? "secondary"}>{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}
