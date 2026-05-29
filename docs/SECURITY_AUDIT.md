# CareerWave Security Hardening Audit

This pass focuses on production hardening without changing the application feature set.

## Authentication

- Access and refresh JWTs now include issuer, audience, not-before, and unique JWT IDs.
- Refresh-token rotation remains enabled. Reuse/invalid-token detection revokes the user's active refresh tokens when possible.
- Refresh tokens are stored only as SHA-256 hashes in the database.
- Auth endpoints use IP-based rate limiting to reduce brute-force attempts.
- Auth cookies are `httpOnly`; production cookies are `secure`; refresh-token cookies use `sameSite: strict` and are scoped to `/api/auth`.

## API safety

- Shared API error handling avoids leaking server-side error details in production for 500-class errors.
- JSON endpoints validate `content-type: application/json` before parsing.
- Zod validation errors are returned as structured `422` responses.
- Mutating endpoints added in this pass use a simple write rate limit.

## Input sanitization

- Auth and employer-review payloads are normalized and HTML-escaped before validation/storage.
- Cover letters are sanitized before application creation.
- This is defense-in-depth. UI should still render user-provided text as text, not raw HTML.

## Upload validation

- Uploads are limited by `MAX_UPLOAD_MB`.
- Only PDF, DOC, and DOCX MIME types/extensions are accepted.
- Basic file signature checks were added for PDF/DOC/DOCX.
- Filenames are normalized and stripped of path separators/control characters.
- Writes use exclusive file creation to avoid overwrites.

## Middleware/security headers

- Middleware validates access-token issuer/audience on protected pages.
- Security headers were added globally and in middleware:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - restricted `Permissions-Policy`
- Next.js `poweredByHeader` is disabled.

## Access-control audit

- Job seeker pages/API calls use `requireRole(["JOB_SEEKER"])`.
- Employer dashboards and applicant management rely on employer ownership helpers before returning or mutating application/job data.
- Public job routes remain read-only and expose only active public listings.

## Remaining production notes

- The in-memory rate limiter is fine for a university project and local demos. On Vercel with multiple serverless instances, replace it with Upstash Redis or another shared store.
- Local disk uploads are acceptable for the project demo. On Vercel production, use S3, Cloudflare R2, UploadThing, or Supabase Storage.
- Add virus scanning for uploads before real-world production use.
- Add CSRF tokens if you later allow third-party origins or non-SameSite cookie flows.
