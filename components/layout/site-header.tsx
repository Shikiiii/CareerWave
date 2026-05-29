import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { publicNavItems } from "@/config/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getCurrentAuthUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getCurrentAuthUser();
  const isAuthenticated = Boolean(user);
  const dashboardHref = user?.role === "EMPLOYER" ? "/employer" : "/account";

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo className="text-xl" />

          <nav className="hidden items-center gap-1 md:flex">
            {publicNavItems.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              <Link
                href={dashboardHref}
                className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 sm:inline-flex"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
              >
                Register
              </Link>
            </>
          )}

          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
