import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/lib/env";
import type { AuthRole, AuthUser } from "@/types/auth";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  type: "access";
  jti: string;
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  type: "refresh";
  tokenVersion: string;
  jti: string;
};

export type RefreshTokenResult = {
  token: string;
  hash: string;
  expiresAt: Date;
};

function parseExpiresInToMs(value: string): number {
  const match = value.trim().match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export function createAccessToken(user: AuthUser): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "access",
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    notBefore: "0s",
  } as SignOptions);
}

export function createRefreshToken(user: AuthUser): RefreshTokenResult {
  const tokenVersion = crypto.randomUUID();
  const payload: RefreshTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "refresh",
    tokenVersion,
    jti: crypto.randomUUID(),
  };

  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    notBefore: "0s",
  } as SignOptions);

  return {
    token,
    hash: hashToken(token),
    expiresAt: new Date(Date.now() + parseExpiresInToMs(env.JWT_REFRESH_EXPIRES_IN)),
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as AccessTokenPayload;
  if (payload.type !== "access") {
    throw new Error("Invalid access token type");
  }
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as RefreshTokenPayload;
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token type");
  }
  return payload;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
