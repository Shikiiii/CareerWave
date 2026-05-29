import { z } from "zod";

export const employerApplicationActionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  recruiterNotes: z.string().max(3000).optional(),
});

export const interviewNoteSchema = z.object({
  status: z.enum(["NOT_SCHEDULED", "SCHEDULED", "COMPLETED", "CANCELLED"]).default("NOT_SCHEDULED"),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(3000).optional().or(z.literal("")),
});
