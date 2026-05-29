import Link from "next/link";
import { Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-bold text-blue-700", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
        <Waves className={cn("h-5 w-5", iconClassName)} />
      </span>
      <span>CareerWave</span>
    </Link>
  );
}
