# Production checklist

## Before deployment

- [ ] `.env` is not committed.
- [ ] `.env.production.example` contains placeholders only.
- [ ] `JWT_ACCESS_SECRET` is strong and unique.
- [ ] `JWT_REFRESH_SECRET` is strong and different from access secret.
- [ ] `DATABASE_URL` points to production PostgreSQL.
- [ ] Production database requires SSL.
- [ ] `NODE_ENV=production` in production so cookies are marked secure.
- [ ] `NEXT_PUBLIC_APP_URL=https://careerwave.eu`.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Database

- [ ] Migrations exist in `prisma/migrations`.
- [ ] Production migrations are applied with `npx prisma migrate deploy`.
- [ ] Demo seed data is only used for demo/staging, not real public production.
- [ ] Database backups are enabled at the provider level.

## Auth/security

- [ ] Passwords are hashed with bcrypt.
- [ ] Refresh tokens are stored securely/hashed server-side.
- [ ] Cookies are `httpOnly`, `secure` in production, and have safe same-site settings.
- [ ] Auth endpoints have rate limiting.
- [ ] Protected routes validate role and account status.
- [ ] Employer APIs check ownership of jobs/applications.
- [ ] Job seeker APIs prevent access to other users' applications/documents.

## Uploads

- [ ] Upload size limits are enabled.
- [ ] MIME type validation is enabled.
- [ ] Filenames are sanitized.
- [ ] For real production, uploads are moved to persistent object storage.

## UX/demo

- [ ] Homepage has seeded jobs.
- [ ] Job seeker account can apply to a job.
- [ ] Employer account can review an application.
- [ ] Status changes generate notifications.
- [ ] Responsive layout works on mobile and desktop.

## Domain

- [ ] `careerwave.eu` added in Vercel.
- [ ] DNS records configured.
- [ ] HTTPS is active.
