"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, FileText, Heart, UserRound } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardOverview() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ applications: 0, documents: 0, bookmarks: 0 });

  useEffect(() => {
    async function load() {
      const [applications, documents, bookmarks] = await Promise.allSettled([
        apiClient.get("/account/applications"),
        apiClient.get("/account/documents"),
        apiClient.get("/account/bookmarks"),
      ]);
      setCounts({
        applications: applications.status === "fulfilled" ? applications.value.data.data.applications.length : 0,
        documents: documents.status === "fulfilled" ? documents.value.data.data.documents.length : 0,
        bookmarks: bookmarks.status === "fulfilled" ? bookmarks.value.data.data.bookmarks.length : 0,
      });
    }
    void load();
  }, []);

  const completion = useMemo(() => {
    const profile = user?.profile;
    let score = 0;
    if (profile?.fullName) score += 25;
    if (profile?.headline) score += 25;
    if (profile?.location) score += 25;
    if (counts.documents > 0) score += 25;
    return score;
  }, [counts.documents, user?.profile]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-8 text-white shadow-sm shadow-blue-900/20">
        <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Career workspace</Badge>
        <h2 className="mt-4 text-2xl font-bold">Keep your profile ready before applying.</h2>
        <p className="mt-2 max-w-2xl text-blue-50">Manage your CV, saved jobs, and all submitted applications from this dashboard.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="secondary"><Link href="/account/profile">Complete profile</Link></Button><Button asChild variant="outline" className="border-white bg-white/10 text-white hover:bg-white/20"><Link href="/">Browse jobs</Link></Button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={UserRound} label="Profile completion" value={`${completion}%`} />
        <Stat icon={FileText} label="Saved documents" value={counts.documents} />
        <Stat icon={BriefcaseBusiness} label="Applications" value={counts.applications} />
        <Stat icon={Heart} label="Saved jobs" value={counts.bookmarks} />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return <Card><CardHeader className="pb-2"><Icon className="h-6 w-6 text-blue-700" /><CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-slate-900">{value}</p></CardContent></Card>;
}
