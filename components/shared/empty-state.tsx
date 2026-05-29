import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-6 py-12 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p> : null}
      {actionLabel && onAction ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
