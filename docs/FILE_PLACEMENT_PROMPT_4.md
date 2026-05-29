# Prompt 4 File Placement - Backend Authentication

Added backend authentication implementation only.

## Added files

- `lib/auth/password.ts` - bcrypt password hashing and verification helpers.
- `lib/auth/tokens.ts` - JWT access/refresh token creation, verification, and SHA-256 token hashing.
- `lib/auth/cookies.ts` - secure auth cookie names and options.
- `lib/auth/session.ts` - server-side current-user, require-auth, and require-role helpers.
- `lib/auth/edge.ts` - Edge Runtime-compatible JWT verification for Next.js middleware.
- `lib/auth/handlers.ts` - shared authenticated response helper.
- `lib/auth/index.ts` - auth utility barrel exports.
- `lib/validation/auth.ts` - Zod schemas for login and registration.
- `app/api/auth/register/job-seeker/route.ts` - job seeker registration endpoint.
- `app/api/auth/register/employer/route.ts` - employer registration endpoint.
- `app/api/auth/login/route.ts` - login endpoint.
- `app/api/auth/logout/route.ts` - logout endpoint.
- `app/api/auth/refresh/route.ts` - refresh-token rotation endpoint.
- `app/api/auth/me/route.ts` - current authenticated user endpoint.
- `middleware.ts` - route protection and role-based redirects.

## Auth routes

- `POST /api/auth/register/job-seeker`
- `POST /api/auth/register/employer`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Notes

- Refresh tokens are stored only as SHA-256 hashes in the database.
- Refresh tokens are rotated every time `/api/auth/refresh` succeeds.
- Access and refresh tokens are stored in `httpOnly` cookies.
- Middleware protects employer/job-seeker route groups and redirects users based on role.
