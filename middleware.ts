import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessTokenEdge } from "@/lib/auth/edge";

const EMPLOYER_PREFIXES = ["/employer", "/dashboard/employer"];
const JOB_SEEKER_PREFIXES = ["/account", "/dashboard/user", "/applications", "/saved-jobs"];
const AUTH_PAGES = ["/login", "/register"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const jwtSecret = process.env.JWT_ACCESS_SECRET;

  const isEmployerRoute = startsWithAny(pathname, EMPLOYER_PREFIXES);
  const isJobSeekerRoute = startsWithAny(pathname, JOB_SEEKER_PREFIXES);
  const isProtectedRoute = isEmployerRoute || isJobSeekerRoute;

  if (!isProtectedRoute && !AUTH_PAGES.some((path) => pathname.startsWith(path))) {
    return applySecurityHeaders(NextResponse.next());
  }

  const user = accessToken && jwtSecret
    ? await verifyAccessTokenEdge(accessToken, jwtSecret, {
        issuer: process.env.JWT_ISSUER ?? "careerwave.eu",
        audience: process.env.JWT_AUDIENCE ?? "careerwave-web",
      })
    : null;

  if (AUTH_PAGES.some((path) => pathname.startsWith(path)) && user) {
    const url = request.nextUrl.clone();
    url.pathname = user.role === "EMPLOYER" ? "/employer" : "/account";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  if (!isProtectedRoute) {
    return applySecurityHeaders(NextResponse.next());
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  if (isEmployerRoute && user.role !== "EMPLOYER" && user.role !== "ADMIN") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/account", request.url)));
  }

  if (isJobSeekerRoute && user.role !== "JOB_SEEKER" && user.role !== "ADMIN") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/employer", request.url)));
  }

  const response = NextResponse.next();
  response.headers.set("x-careerwave-user-id", user.sub);
  response.headers.set("x-careerwave-user-role", user.role);

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/login/:path*",
    "/register/:path*",
    "/account/:path*",
    "/applications/:path*",
    "/saved-jobs/:path*",
    "/employer/:path*",
    "/dashboard/:path*",
  ],
};
