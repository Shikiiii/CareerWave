# Header and footer update

## Added/changed files

- `app/layout.tsx` now wraps every page with `SiteHeader` and `SiteFooter`.
- `components/layout/site-header.tsx` was improved with auth-aware navigation.
- `components/layout/mobile-nav.tsx` now shows login/register for guests and dashboard/logout/notifications for authenticated users.
- `components/layout/site-footer.tsx` was redesigned into a large blue footer inspired by the big-brand footer style.
- `config/navigation.ts` now points the public Jobs link to `/`, because the homepage currently acts as the job browsing page.

## Header behavior

- Guests see Login and Create account.
- Logged-in job seekers see My dashboard, notifications and logout.
- Logged-in employers see Employer dashboard, notifications and logout.

## Footer behavior

The footer is intentionally large and visual. It contains platform links, candidate links, employer links, project/contact links, CTA cards and a large CareerWave wordmark.
