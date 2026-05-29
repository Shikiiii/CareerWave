"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/toast-store";
import { cn } from "@/lib/utils";

const iconByVariant = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} satisfies Record<ToastVariant, typeof CheckCircle2>;

const styleByVariant = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-950",
} satisfies Record<ToastVariant, string>;

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100] grid w-[calc(100%-2rem)] max-w-sm gap-3">
      {toasts.map((toast) => {
        const Icon = iconByVariant[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex gap-3 rounded-2xl border p-4 shadow-lg shadow-slate-950/10 backdrop-blur animate-in slide-in-from-bottom-2",
              styleByVariant[toast.variant],
            )}
            role="status"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
            </div>
            <button type="button" onClick={() => dismissToast(toast.id)} className="rounded-full p-1 opacity-70 hover:bg-white/50 hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss notification</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
