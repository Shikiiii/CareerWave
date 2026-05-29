import { z } from "zod";

const urlField = z.string().url("Enter a valid URL.").optional().or(z.literal(""));

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required.").max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  headline: z.string().max(160).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  skills: z.array(z.string().min(1).max(40)).max(30).default([]),
  education: z.string().max(3000).optional().or(z.literal("")),
  workExperience: z.string().max(5000).optional().or(z.literal("")),
  websiteUrl: urlField,
  linkedinUrl: urlField,
  githubUrl: urlField,
});

export const bookmarkSchema = z.object({
  jobId: z.string().min(1),
});
