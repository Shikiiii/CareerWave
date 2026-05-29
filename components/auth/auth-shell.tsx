import Link from "next/link";
import { Waves } from "lucide-react";

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border bg-white shadow-xl lg:grid-cols-[1fr_1.05fr]">
          <section className="hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white lg:block">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Waves className="h-6 w-6" />
              </span>
              CareerWave
            </Link>
            <div className="mt-24 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-100">careerwave.eu</p>
              <h1 className="mt-4 text-5xl font-bold leading-tight">Catch the next wave of your career.</h1>
              <p className="mt-6 text-lg text-blue-50">
                A modern job portal for candidates and employers, with clean applications, dashboards, and review workflows.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-blue-700">
                <Waves className="h-6 w-6" />
                CareerWave
              </Link>
            </div>
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              </div>
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
