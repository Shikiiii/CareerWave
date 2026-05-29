# Homepage sorting fix

Fixed the homepage job sorting so Newest/Oldest uses the actual `JobListing.createdAt` timestamp.

Changes:
- `app/page.tsx` now orders jobs by `createdAt` with a stable secondary `id` sort.
- `app/api/jobs/route.ts` uses the same ordering logic for API results.
- `components/jobs/job-card.tsx` now displays the same `createdAt` timestamp used for sorting, so the visible "Posted ..." label matches the list order.

Salary sorting still uses salary fields first, then falls back to newest created listings for stable ordering.
