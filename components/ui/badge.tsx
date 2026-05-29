import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-blue-100 text-blue-800 ring-blue-700/10",
  secondary: "bg-slate-100 text-slate-700 ring-slate-700/10",
  success: "bg-emerald-100 text-emerald-800 ring-emerald-700/10",
  warning: "bg-amber-100 text-amber-800 ring-amber-700/10",
  destructive: "bg-red-100 text-red-800 ring-red-700/10",
  outline: "bg-white text-slate-700 ring-slate-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
