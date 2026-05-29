"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function BookmarkButton({ jobId, initialSaved = false }: { jobId: string; initialSaved?: boolean }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "JOB_SEEKER") return;

    apiClient
      .get(`/account/bookmarks/${jobId}`)
      .then((response) => setSaved(Boolean(response.data.data.saved)))
      .catch(() => null);
  }, [jobId, user]);

  async function toggle() {
    if (!user || user.role !== "JOB_SEEKER") {
      toast.info("Login required", "Log in as a job seeker to save jobs.");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await apiClient.delete(`/account/bookmarks/${jobId}`);
        setSaved(false);
        toast.success("Removed from saved jobs");
      } else {
        await apiClient.post("/account/bookmarks", { jobId });
        setSaved(true);
        toast.success("Job saved", "You can find it in your dashboard bookmarks.");
      }
    } catch (error) {
      toast.error("Could not update bookmark", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant={saved ? "default" : "outline"} className="w-full" onClick={() => void toggle()} disabled={loading}>
      <Heart className={saved ? "mr-2 h-4 w-4 fill-current" : "mr-2 h-4 w-4"} />
      {loading ? "Saving..." : saved ? "Saved" : "Save job"}
    </Button>
  );
}
