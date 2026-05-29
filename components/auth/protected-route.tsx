"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthRole } from "@/types/auth";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: AuthRole[] }) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "guest") router.replace("/login");
    if (status === "authenticated" && roles?.length && user && !roles.includes(user.role)) {
      router.replace(user.role === "EMPLOYER" ? "/employer" : "/account");
    }
  }, [router, roles, status, user]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm text-muted-foreground">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (roles?.length && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
