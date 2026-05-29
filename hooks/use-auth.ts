"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const auth = useAuthStore();
  const status = useAuthStore((state) => state.status);
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    if (status === "idle") {
      void bootstrap();
    }
  }, [bootstrap, status]);

  return auth;
}
