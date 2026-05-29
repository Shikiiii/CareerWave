"use client";

import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { publicNavItems } from "@/config/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import type { AuthUser } from "@/types/auth";

type MobileNavProps = {
  user?: AuthUser | null;
};

export function MobileNav({ user }: MobileNavProps) {
  const dashboardHref = user?.role === "EMPLOYER" ? "/employer" : "/account";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="top-4 translate-y-0 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <Logo className="text-xl" />
        </DialogHeader>

        <nav className="mt-6 grid gap-2">
          {publicNavItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 grid gap-2 border-t pt-6">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50">
                Login
              </Link>
              <Link href="/register" className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700">
                Create account
              </Link>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
