import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Job is required."),
  coverLetter: z.string().max(5000, "Cover letter must be under 5000 characters.").optional().or(z.literal("")),
  cvMode: z.enum(["saved", "upload"]),
  savedCvId: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
