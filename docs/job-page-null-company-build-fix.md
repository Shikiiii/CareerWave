# Job page nullable company build fix

The Vercel production build failed because `company` can be `null` when rendering the job details card, but the `next/image` alt text accessed `company.companyName` directly.

Updated `app/jobs/[slug]/page.tsx` to use a safe fallback:

```tsx
alt={`${company?.companyName || "Company"} logo`}
```

This keeps the job page safe even if an employer exists without a completed company profile.
