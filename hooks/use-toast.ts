"use client";

import { useToastStore } from "@/store/toast-store";

export function useToast() {
  const showToast = useToastStore((state) => state.showToast);

  return {
    success: (title: string, description?: string) => showToast({ title, description, variant: "success" }),
    error: (title: string, description?: string) => showToast({ title, description, variant: "error" }),
    info: (title: string, description?: string) => showToast({ title, description, variant: "info" }),
  };
}
