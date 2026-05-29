# CareerWave Prompt 5 — Frontend Authentication File Placement

This prompt adds only the frontend authentication layer on top of Prompt 4.

## Added files

- `app/providers.tsx` — client bootstrap provider for restoring the auth session from `/api/auth/me`.
- `app/login/page.tsx` — login page with React Hook Form + Zod validation.
- `app/register/page.tsx` — account type chooser.
- `app/register/job-seeker/page.tsx` — job seeker registration page.
- `app/register/employer/page.tsx` — employer registration page.
- `app/account/page.tsx` — protected job seeker dashboard placeholder.
- `app/employer/page.tsx` — protected employer dashboard placeholder.
- `components/auth/auth-shell.tsx` — shared polished blue authentication layout.
- `components/auth/form-field.tsx` — reusable validated input field.
- `components/auth/logout-button.tsx` — logout flow button.
- `components/auth/protected-route.tsx` — client-side protected route UX/loading fallback.
- `components/ui/alert.tsx` — minimal shadcn-style alert primitive.
- `components/ui/button.tsx` — minimal shadcn-style button primitive.
- `components/ui/card.tsx` — minimal shadcn-style card primitives.
- `components/ui/input.tsx` — minimal shadcn-style input primitive.
- `components/ui/label.tsx` — minimal shadcn-style label primitive.
- `components/ui/textarea.tsx` — minimal shadcn-style textarea primitive.
- `hooks/use-auth.ts` — auth hook wrapper.
- `lib/api-client.ts` — Axios API client with refresh retry support.
- `store/auth-store.ts` — Zustand auth store.

## Modified files

- `app/layout.tsx` — wraps the app with `<Providers />`.
- `app/page.tsx` — adds auth navigation and registration CTAs.
- `types/auth.ts` — expands shared frontend auth types.

## Notes

Auth persistence is cookie-based through the backend httpOnly JWT cookies from Prompt 4. The frontend store restores the current user by calling `/api/auth/me`; it does not store JWTs in localStorage.
