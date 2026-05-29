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
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  location: z.string().trim().max(120).optional(),
});

type RegisterJobSeekerForm = z.infer<typeof schema>;

export default function RegisterJobSeekerPage() {
  const router = useRouter();
  const registerJobSeeker = useAuthStore((state) => state.registerJobSeeker);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const form = useForm<RegisterJobSeekerForm>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", location: "" },
  });

  async function onSubmit(values: RegisterJobSeekerForm) {
    await registerJobSeeker(values);
    router.push("/account");
    router.refresh();
  }

  return (
    <AuthShell title="Register as a job seeker" subtitle="Build your profile and apply to jobs faster with CareerWave.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}
        <FormField label="Full name" autoComplete="name" {...form.register("fullName")} error={form.formState.errors.fullName} />
        <FormField label="Email" type="email" autoComplete="email" {...form.register("email")} error={form.formState.errors.email} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
          error={form.formState.errors.password}
        />
        <FormField label="Location" placeholder="Sofia, Bulgaria" {...form.register("location")} error={form.formState.errors.location} />
        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Create job seeker account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Registering a company?{" "}
        <Link href="/register/employer" className="font-medium text-blue-700 hover:underline">
          Employer registration
        </Link>
      </p>
    </AuthShell>
  );
}
