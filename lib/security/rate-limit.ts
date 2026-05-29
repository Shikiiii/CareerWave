import { NextRequest } from "next/server";

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function cleanupExpiredBuckets(now = Date.now()) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(request: NextRequest, config: RateLimitConfig) {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = `${config.keyPrefix ?? "global"}:${ip}`;
  const current = buckets.get(key);

  cleanupExpiredBuckets(now);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (current.count >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - current.count),
    resetAt: current.resetAt,
  };
}

export const authRateLimit = {
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 60_000),
  keyPrefix: "auth",
};

export const writeRateLimit = {
  limit: Number(process.env.WRITE_RATE_LIMIT_MAX ?? 60),
  windowMs: Number(process.env.WRITE_RATE_LIMIT_WINDOW_MS ?? 60_000),
  keyPrefix: "write",
};
