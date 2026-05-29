# CareerWave Database Layer

This prompt adds the production-ready Prisma database layer for CareerWave.

## Added / updated files

- `prisma/schema.prisma` — complete database schema with enums, indexes, and relations.
- `prisma/migrations/20260522000100_init_database/migration.sql` — initial PostgreSQL migration.
- `prisma/seed.ts` — realistic demo data for users, employers, jobs, applications, bookmarks, notifications, and interview notes.
- `lib/prisma.ts` — Prisma singleton client, already present from setup and kept compatible.
- `lib/db/pagination.ts` — safe pagination helpers.
- `lib/db/job-filters.ts` — reusable job filtering `where` builder.
- `lib/db/includes.ts` — reusable Prisma include objects for common queries.
- `lib/db/transactions.ts` — typed transaction helper.
- `lib/db/index.ts` — database helper barrel export.

## Demo accounts

All seeded accounts use this password:

```txt
Password123!
```

Seeded job seeker accounts:

- `maria.petkova@example.com`
- `ivan.georgiev@example.com`
- `elena.stoyanova@example.com`

Seeded employer accounts:

- `hr@bluepeak.example.com`
- `jobs@danubefintech.example.com`
- `people@northstarcloud.example.com`

## Commands

Generate Prisma client:

```bash
npm run prisma:generate
```

Create/apply local migration:

```bash
npm run prisma:migrate
```

Apply migrations in production:

```bash
npm run prisma:deploy
```

Seed database:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Relationship summary

- `User` is the shared authentication table for job seekers, employers, and admins.
- `UserProfile` belongs to a job seeker user.
- `Employer` belongs to a user with `EMPLOYER` role.
- `CompanyProfile` belongs to an employer and stores public company information.
- `JobListing` belongs to an employer.
- `Application` connects a job seeker user to a job listing.
- `UploadedDocument` belongs to a user and can optionally be attached to an application.
- `Bookmark` connects users and saved job listings.
- `Notification` belongs to a user.
- `InterviewNote` belongs to an application and the reviewing employer.

## Important constraints

- A user can apply to the same job only once via `@@unique([userId, jobId])` on `Application`.
- A user can bookmark the same job only once via `@@unique([userId, jobId])` on `Bookmark`.
- Each employer has exactly one optional company profile.
- Each job has a unique slug for public URLs.
- Refresh tokens are stored as hashes, not raw tokens.

## Notes for next prompt

The next prompt should implement backend authentication using this schema:

- `User`
- `RefreshToken`
- `Employer`
- `CompanyProfile`
- `UserProfile`

Do not store raw refresh tokens. Hash them before saving to `RefreshToken.tokenHash`.
