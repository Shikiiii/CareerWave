import { AlertCircle } from "lucide-react";

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <p className="flex items-center gap-2 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {message}
    </p>
  );
}
