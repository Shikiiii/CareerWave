# Company profiles, compensation, and job card update

This update adds:

- clickable company profile pages at `/companies/[id]`
- active job listings shown inside each company profile
- richer job cards inspired by jobs.bg-style listings
- posted date and view count on job listings
- job listing view counter incrementing when opening a job page
- salary display modes:
  - not specified
  - flat salary
  - salary range
- salary tax display:
  - unspecified
  - net / after tax
  - gross / before tax
- larger demo seed data for major Bulgarian employers
- simple local SVG company logos in `public/uploads/company-logos`

After pulling this update locally, run:

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run dev
```

If you already have test data and want the new Bulgarian companies/examples, `npm run db:seed` resets and repopulates demo data.
