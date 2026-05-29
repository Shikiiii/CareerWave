# Companies Page Relation Fix

Fixed `/companies` crashing with PrismaClientValidationError.

## Cause

The page attempted to include `employer.jobListings`, but the Prisma schema defines the relation on `Employer` as:

```prisma
jobs JobListing[]
```

## Updated file

- `app/companies/page.tsx`

The include now uses:

```ts
employer: {
  include: {
    jobs: {
      where: { status: "ACTIVE" },
      select: { id: true },
    },
  },
}
```

The UI now reads `company.employer.jobs.length`.
