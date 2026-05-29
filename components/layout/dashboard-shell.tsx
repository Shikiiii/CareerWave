"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import type { DashboardNavItem } from "@/components/layout/dashboard-sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  navItems,
  title,
  className,
}: {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  title: string;
  className?: string;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="flex">
        <DashboardSidebar items={navItems} title={title} />
        <div className="min-w-0 flex-1">
          <main className={cn("px-4 py-10 sm:px-6 lg:px-10", className)}>
            <div className="mb-6 lg:hidden">
              <MobileDashboardNav items={navItems} title={title} />
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileDashboardNav({ items, title }: { items: DashboardNavItem[]; title: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label="Open dashboard navigation">
          <Menu className="h-4 w-4" />
          {title} menu
        </Button>
      </DialogTrigger>
      <DialogContent className="top-4 translate-y-0 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title} navigation</DialogTitle>
        </DialogHeader>
        <nav className="mt-4 grid gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
