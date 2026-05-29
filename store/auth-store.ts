"use client";

import { create } from "zustand";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import type { AuthRole, CurrentUser, LoginInput, RegisterEmployerInput, RegisterJobSeekerInput } from "@/types/auth";

type AuthStatus = "idle" | "loading" | "authenticated" | "guest";

type AuthState = {
  user: CurrentUser | null;
  status: AuthStatus;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (input: LoginInput) => Promise<CurrentUser>;
  registerJobSeeker: (input: RegisterJobSeekerInput) => Promise<CurrentUser>;
  registerEmployer: (input: RegisterEmployerInput) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (roles: AuthRole[]) => boolean;
};

function normalizeUser(raw: any): CurrentUser {
  return raw?.data?.user ?? raw?.user ?? raw;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  error: null,

  bootstrap: async () => {
    if (get().status === "loading") return;
    set({ status: "loading", error: null });

    try {
      const response = await apiClient.get("/auth/me");
      const user = normalizeUser(response.data);
      set({ user, status: "authenticated", error: null });
    } catch {
      set({ user: null, status: "guest", error: null });
    }
  },

  login: async (input) => {
    set({ status: "loading", error: null });

    try {
      await apiClient.post("/auth/login", input);
      const response = await apiClient.get("/auth/me");
      const user = normalizeUser(response.data);
      set({ user, status: "authenticated", error: null });
      return user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to log in.");
      set({ user: null, status: "guest", error: message });
      throw new Error(message);
    }
  },

  registerJobSeeker: async (input) => {
    set({ status: "loading", error: null });

    try {
      await apiClient.post("/auth/register/job-seeker", input);
      const response = await apiClient.get("/auth/me");
      const user = normalizeUser(response.data);
      set({ user, status: "authenticated", error: null });
      return user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to register.");
      set({ user: null, status: "guest", error: message });
      throw new Error(message);
    }
  },

  registerEmployer: async (input) => {
    set({ status: "loading", error: null });

    try {
      await apiClient.post("/auth/register/employer", input);
      const response = await apiClient.get("/auth/me");
      const user = normalizeUser(response.data);
      set({ user, status: "authenticated", error: null });
      return user;
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to register employer.");
      set({ user: null, status: "guest", error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ status: "loading", error: null });

    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, status: "guest", error: null });
    }
  },

  clearError: () => set({ error: null }),

  hasRole: (roles) => {
    const role = get().user?.role;
    return Boolean(role && roles.includes(role));
  },
}));
