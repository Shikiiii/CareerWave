import { BriefcaseBusiness, Building2, ClipboardList, FileText, Heart, Home, LayoutDashboard, UserRound, UsersRound } from "lucide-react";

export const publicNavItems = [
  { label: "Jobs", href: "/" },
  { label: "Companies", href: "/companies" },
];

export const jobSeekerNavItems = [
  { label: "Overview", href: "/account", icon: LayoutDashboard },
  { label: "Profile", href: "/account/profile", icon: UserRound },
  { label: "My CV", href: "/account/documents", icon: FileText },
  { label: "Applications", href: "/account/applications", icon: BriefcaseBusiness },
  { label: "Saved jobs", href: "/account/bookmarks", icon: Heart },
];

export const employerNavItems = [
  { label: "Overview", href: "/employer", icon: LayoutDashboard },
  { label: "Company profile", href: "/employer/company", icon: Building2 },
  { label: "Job listings", href: "/employer/jobs", icon: ClipboardList },
  { label: "Applicants", href: "/employer/applicants", icon: UsersRound },
];

export const quickLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse jobs", href: "/", icon: BriefcaseBusiness },
  { label: "Register company", href: "/register/employer", icon: Building2 },
];
