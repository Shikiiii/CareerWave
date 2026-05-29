import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Choose how you want to use CareerWave.">
      <div className="grid gap-4">
        <Link href="/register/job-seeker">
          <Card className="transition hover:border-blue-300 hover:shadow-md">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <UserRound className="h-6 w-6" />
              </span>
              <div>
                <CardTitle className="text-xl">I am looking for a job</CardTitle>
                <CardDescription>Create a profile, upload your CV, and apply to open roles.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/register/employer">
          <Card className="transition hover:border-blue-300 hover:shadow-md">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <CardTitle className="text-xl">I represent a company</CardTitle>
                <CardDescription>Register your firm, publish job offers, and review applicants.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
