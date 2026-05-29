"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters.").max(160),
  companyEmail: z.string().trim().toLowerCase().email("Enter a valid company email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  location: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
});

type RegisterEmployerForm = z.infer<typeof schema>;

export default function RegisterEmployerPage() {
  const router = useRouter();
  const registerEmployer = useAuthStore((state) => state.registerEmployer);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const form = useForm<RegisterEmployerForm>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: "", companyEmail: "", password: "", location: "", industry: "", description: "" },
  });

  async function onSubmit(values: RegisterEmployerForm) {
    await registerEmployer(values);
    router.push("/employer");
    router.refresh();
  }

  return (
    <AuthShell title="Register your company" subtitle="Create an employer account and start publishing job offers.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}
        <FormField label="Company name" {...form.register("companyName")} error={form.formState.errors.companyName} />
        <FormField
          label="Company email"
          type="email"
          autoComplete="email"
          {...form.register("companyEmail")}
          error={form.formState.errors.companyEmail}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
          error={form.formState.errors.password}
        />
        <FormField label="Location" placeholder="Sofia, Bulgaria" {...form.register("location")} error={form.formState.errors.location} />
        <FormField label="Industry" placeholder="Software, Finance, Retail..." {...form.register("industry")} error={form.formState.errors.industry} />
        <div className="space-y-2">
          <Label htmlFor="description">Company description</Label>
          <Textarea id="description" placeholder="Briefly describe your company..." {...form.register("description")} />
          {form.formState.errors.description ? <p className="text-sm text-red-600">{form.formState.errors.description.message}</p> : null}
        </div>
        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Create employer account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Looking for a job?{" "}
        <Link href="/register/job-seeker" className="font-medium text-blue-700 hover:underline">
          Job seeker registration
        </Link>
      </p>
    </AuthShell>
  );
}
