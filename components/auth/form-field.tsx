import * as React from "react";
import type { FieldError } from "react-hook-form";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FormField = React.forwardRef<HTMLInputElement, InputProps & { label: string; error?: FieldError }>(
  ({ label, error, ...props }, ref) => (
    <div className="space-y-2">
      <Label htmlFor={props.id ?? props.name}>{label}</Label>
      <Input ref={ref} id={props.id ?? props.name} aria-invalid={Boolean(error)} {...props} />
      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
    </div>
  ),
);
FormField.displayName = "FormField";
