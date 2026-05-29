# Next.js 16 Suspense searchParams build fix

Vercel failed during prerendering because `useSearchParams()` was used on `/login` without a Suspense boundary.

Updated:
- `app/login/page.tsx`
  - moved the search-param dependent login form into `LoginFormContent`
  - wrapped it in `<Suspense>`
- `app/page.tsx`
  - wrapped `JobFilters` in `<Suspense>` because it also uses `useSearchParams()`

This prevents Next.js production prerendering from failing with:

`useSearchParams() should be wrapped in a suspense boundary`
