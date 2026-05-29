import { z } from 'zod';
export const jobQuerySchema = z.object({
 q: z.string().optional(), location:z.string().optional(), company:z.string().optional(),
 employmentType:z.string().optional(), experienceLevel:z.string().optional(), remoteType:z.string().optional(),
 minSalary:z.coerce.number().optional(), sort:z.enum(['newest','oldest','salary_high','salary_low']).optional(),
 page:z.coerce.number().default(1), limit:z.coerce.number().default(12)
});
