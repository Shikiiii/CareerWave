import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
export const ACCESS_TOKEN_COOKIE = "careerwave_access_token";
export const REFRESH_TOKEN_COOKIE = "careerwave_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: parseCookieMaxAge(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m", 15 * 60),
};

export const refreshTokenCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/api/auth",
  maxAge: parseCookieMaxAge(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d", 7 * 24 * 60 * 60),
};

export const clearedAccessCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: 0,
};

export const clearedRefreshCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict",
  path: "/api/auth",
  maxAge: 0,
};

export function parseCookieMaxAge(value: string, fallbackSeconds: number): number {
  const match = value.trim().match(/^(\d+)([smhd])$/);
  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 24 * 60 * 60;
    default:
      return fallbackSeconds;
  }
}
