# Demo job posted-date fix

The homepage job cards were showing "Posted today" for almost every seeded job because the card was changed to display `createdAt`, but the seed script was still letting Prisma assign `createdAt` at insert time. Since the seed creates all jobs in one run, all seeded rows had the same current creation date.

Changes made:

- `prisma/seed.ts`
  - assigns deterministic demo `createdAt` values across the last few weeks
  - sets `publishedAt` to the same value so demo sorting and displayed dates stay consistent
- `app/page.tsx`
  - featured jobs now sort by `createdAt` consistently
- `app/companies/[id]/page.tsx`
  - company profile listings now sort by `createdAt`
- `app/jobs/[slug]/page.tsx`
  - job details display the same posted date source as the job cards

After applying this update, reseed the database:

```bash
npm run db:seed
```

If the database schema is not up to date, run this first:

```bash
npx prisma migrate dev
npx prisma generate
```
