export type AuthRole = "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
};

export type CurrentUser = {
  id: string;
  email: string;
  role: AuthRole;
  status: string;
  createdAt?: string;
  profile?: {
    id: string;
    fullName: string;
    location?: string | null;
    headline?: string | null;
  } | null;
  employer?: {
    id: string;
    companyProfile?: {
      id: string;
      companyName: string;
      companyEmail: string;
      location?: string | null;
      industry?: string | null;
    } | null;
  } | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterJobSeekerInput = {
  fullName: string;
  email: string;
  password: string;
  location?: string;
};

export type RegisterEmployerInput = {
  companyName: string;
  companyEmail: string;
  password: string;
  location?: string;
  industry?: string;
  description?: string;
};
