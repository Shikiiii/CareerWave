"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  metadata?: {
    jobId?: string;
    applicationId?: string;
    jobSlug?: string;
  } | null;
  createdAt: string;
};

function notificationHref(notification: Notification) {
  if (notification.type === "NEW_APPLICANT" || notification.type === "APPLICATION_WITHDRAWN") return "/employer/applicants";
  if (notification.type.startsWith("APPLICATION_")) return "/account/applications";
  return null;
}

export function NotificationBell() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await apiClient.get("/notifications?limit=20");
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      toast.error("Could not load notifications", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  async function markAllRead() {
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
      toast.success("Notifications marked as read");
    } catch (error) {
      toast.error("Could not update notifications", getApiErrorMessage(error));
    }
  }

  async function markOneRead(id: string) {
    try {
      await apiClient.patch(`/notifications/${id}`);
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // Non-critical; navigation should still work.
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>Application updates, saved job activity, and employer alerts.</DialogDescription>
            </div>
            {unreadCount > 0 ? (
              <Button size="sm" variant="outline" onClick={() => void markAllRead()}>
                <CheckCheck className="mr-2 h-4 w-4" />Read all
              </Button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-3 h-3 w-full" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-blue-700" />
              <h3 className="mt-3 font-semibold text-slate-950">No notifications yet</h3>
              <p className="mt-1 text-sm text-slate-500">Important application updates will appear here.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const href = notificationHref(notification);
              const content = (
                <div
                  className={cn(
                    "rounded-2xl border p-4 transition hover:border-blue-200 hover:bg-blue-50/50",
                    !notification.readAt && "border-blue-200 bg-blue-50/70",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">{notification.title}</p>
                        {!notification.readAt ? <Badge>New</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {href ? <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-400" /> : null}
                  </div>
                </div>
              );

              if (!href) return <div key={notification.id}>{content}</div>;

              return (
                <Link key={notification.id} href={href} onClick={() => void markOneRead(notification.id)}>
                  {content}
                </Link>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
