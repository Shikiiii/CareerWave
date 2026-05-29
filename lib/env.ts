import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_NAME: z.string().default("CareerWave"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_DOMAIN: z.string().default("careerwave.eu"),
  JWT_ACCESS_SECRET: z.string().min(24),
  JWT_REFRESH_SECRET: z.string().min(24),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_ISSUER: z.string().default("careerwave.eu"),
  JWT_AUDIENCE: z.string().default("careerwave-web"),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  WRITE_RATE_LIMIT_MAX: z.coerce.number().default(60),
  WRITE_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  UPLOAD_DIR: z.string().default("public/uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(5),
});

export const env = envSchema.parse(process.env);
