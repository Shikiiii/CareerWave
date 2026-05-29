"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginForm = z.infer<typeof schema>;

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    const user = await login(values);
    const next = searchParams.get("next");

    router.push(next ?? (user.role === "EMPLOYER" ? "/employer" : "/account"));
    router.refresh();
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error ? <Alert className="border-red-200 bg-red-50 text-red-700">{error}</Alert> : null}
        <FormField label="Email" type="email" autoComplete="email" {...form.register("email")} error={form.formState.errors.email} />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
          error={form.formState.errors.password}
        />
        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to CareerWave?{" "}
        <Link href="/register" className="font-medium text-blue-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your applications or employer dashboard.">
      <Suspense
        fallback={
          <div className="space-y-5">
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 animate-pulse rounded-xl bg-blue-100" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </AuthShell>
  );
}
