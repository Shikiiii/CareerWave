"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function DashboardSidebar({ items, title }: { items: DashboardNavItem[]; title: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col p-5">
        <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <Separator className="my-5" />
        <nav className="grid gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700",
                  active && "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-600 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">CareerWave tip</p>
          <p className="mt-1 text-blue-800/80">Keep your profile and job posts complete to improve matching quality.</p>
        </div>
      </div>
    </aside>
  );
}
