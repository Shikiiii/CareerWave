import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const registerJobSeekerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  location: z.string().trim().max(120).optional(),
});

export const registerEmployerSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  companyEmail: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  location: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});
