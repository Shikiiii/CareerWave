import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Browse jobs", href: "/jobs" },
      { label: "Companies", href: "/companies" },
      { label: "For employers", href: "/register/employer" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Job seeker signup", href: "/register/job-seeker" },
      { label: "Employer signup", href: "/register/employer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo className="text-xl text-white" />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            CareerWave is a modern job portal for candidates and employers, designed with a clean blue interface and practical dashboards.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{group.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">© 2026 CareerWave · careerwave.eu</div>
    </footer>
  );
}
