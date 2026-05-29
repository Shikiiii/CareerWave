"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const status = useAuthStore((state) => state.status);

  async function handleLogout() {
    await logout();

    // Use a hard navigation after clearing the HTTP-only cookies.
    // This prevents protected dashboard pages from briefly rendering empty
    // after logout and guarantees middleware/server components re-evaluate.
    window.location.assign("/login");
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={status === "loading"}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
