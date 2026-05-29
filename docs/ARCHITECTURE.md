# CareerWave Architecture Plan

## 1. Complete folder structure

```txt
careerwave/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
│  ├─ logo.svg
│  └─ uploads/                 # local dev only, not for Vercel production
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  ├─ register/job-seeker/page.tsx
│  │  │  └─ register/employer/page.tsx
│  │  ├─ (public)/
│  │  │  ├─ page.tsx
│  │  │  ├─ jobs/page.tsx
│  │  │  └─ jobs/[slug]/page.tsx
│  │  ├─ dashboard/
│  │  │  ├─ job-seeker/
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ profile/page.tsx
│  │  │  │  ├─ documents/page.tsx
│  │  │  │  ├─ applications/page.tsx
│  │  │  │  └─ bookmarks/page.tsx
│  │  │  └─ employer/
│  │  │     ├─ page.tsx
│  │  │     ├─ jobs/page.tsx
│  │  │     ├─ jobs/new/page.tsx
│  │  │     ├─ jobs/[id]/edit/page.tsx
│  │  │     ├─ jobs/[id]/applications/page.tsx
│  │  │     └─ applications/[id]/page.tsx
│  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  │  ├─ register/job-seeker/route.ts
│  │  │  │  ├─ register/employer/route.ts
│  │  │  │  ├─ login/route.ts
│  │  │  │  ├─ logout/route.ts
│  │  │  │  ├─ refresh/route.ts
│  │  │  │  └─ me/route.ts
│  │  │  ├─ jobs/route.ts
│  │  │  ├─ jobs/[id]/route.ts
│  │  │  ├─ jobs/[id]/apply/route.ts
│  │  │  ├─ applications/route.ts
│  │  │  ├─ applications/[id]/route.ts
│  │  │  ├─ documents/route.ts
│  │  │  ├─ bookmarks/route.ts
│  │  │  └─ notifications/route.ts
│  │  ├─ globals.css
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ ui/                      # shadcn/ui generated components
│  │  ├─ layout/
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ Footer.tsx
│  │  │  ├─ DashboardSidebar.tsx
│  │  │  └─ MobileNav.tsx
│  │  ├─ auth/
│  │  ├─ jobs/
│  │  ├─ applications/
│  │  ├─ employer/
│  │  └─ shared/
│  ├─ lib/
│  │  ├─ prisma.ts
│  │  ├─ auth.ts
│  │  ├─ jwt.ts
│  │  ├─ password.ts
│  │  ├─ api-response.ts
│  │  ├─ upload.ts
│  │  ├─ slug.ts
│  │  └─ utils.ts
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  └─ useDebounce.ts
│  ├─ stores/
│  │  └─ auth-store.ts
│  ├─ types/
│  │  ├─ auth.ts
│  │  ├─ jobs.ts
│  │  └─ applications.ts
│  ├─ validators/
│  │  ├─ auth.schema.ts
│  │  ├─ job.schema.ts
│  │  ├─ profile.schema.ts
│  │  └─ application.schema.ts
│  └─ middleware.ts
├─ .env.example
├─ package.json
└─ README.md
```

## 2. Prisma schema

The planned schema is in `prisma/schema.prisma`.

## 3. Enums

- `UserRole`: `JOB_SEEKER`, `EMPLOYER`, `ADMIN`
- `AccountStatus`: `ACTIVE`, `SUSPENDED`, `DELETED`
- `EmploymentType`: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `FREELANCE`, `TEMPORARY`
- `RemoteType`: `ON_SITE`, `HYBRID`, `REMOTE`
- `ExperienceLevel`: `INTERN`, `JUNIOR`, `MID`, `SENIOR`, `LEAD`, `MANAGER`
- `JobStatus`: `DRAFT`, `ACTIVE`, `PAUSED`, `CLOSED`, `DELETED`
- `ApplicationStatus`: `SUBMITTED`, `REVIEWING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`
- `DocumentType`: `CV`, `COVER_LETTER`, `CERTIFICATE`, `PORTFOLIO`, `OTHER`
- `NotificationType`: application/job workflow notification events
- `InterviewStatus`: `NOT_SCHEDULED`, `SCHEDULED`, `COMPLETED`, `CANCELLED`

## 4. Relationships

- `User` is the central auth identity.
- A job seeker has one `UserProfile`.
- An employer has one `Employer` company profile.
- An employer owns many `JobListing` records.
- A job seeker can create one `Application` per job.
- An application can have many `UploadedDocument` records.
- A job seeker can bookmark many jobs through `Bookmark`.
- Users receive `Notification` records.
- Accepted applications can have `InterviewNote` records created by employers.

## 5. Authentication architecture

- Passwords are stored as bcrypt hashes.
- Access tokens are short-lived JWTs, around 15 minutes.
- Refresh tokens are long-lived, around 7 to 30 days.
- Refresh tokens are stored hashed in PostgreSQL.
- The frontend stores tokens using secure HTTP-only cookies where possible.
- Middleware protects dashboard routes.
- API handlers validate role access before returning private data.

Recommended cookies:

- `careerwave_access_token`
- `careerwave_refresh_token`

Access token payload:

```ts
{
  sub: user.id,
  email: user.email,
  role: user.role
}
```

## 6. Upload architecture

Development:

- Store files under `public/uploads`.
- Save only metadata and file URL in PostgreSQL.

Production:

- Vercel filesystem is not persistent.
- Use UploadThing, S3, Cloudflare R2, or Supabase Storage.
- Keep `src/lib/upload.ts` as an abstraction so storage can be swapped.

Allowed files:

- PDF
- DOC
- DOCX
- PNG/JPG for certificates if needed

Suggested size limit:

- CV: 5 MB
- Extra documents: 10 MB each

## 7. Route architecture

Public routes:

- `/`
- `/jobs`
- `/jobs/[slug]`
- `/login`
- `/register`
- `/register/job-seeker`
- `/register/employer`

Job seeker routes:

- `/dashboard/job-seeker`
- `/dashboard/job-seeker/profile`
- `/dashboard/job-seeker/documents`
- `/dashboard/job-seeker/applications`
- `/dashboard/job-seeker/bookmarks`

Employer routes:

- `/dashboard/employer`
- `/dashboard/employer/jobs`
- `/dashboard/employer/jobs/new`
- `/dashboard/employer/jobs/[id]/edit`
- `/dashboard/employer/jobs/[id]/applications`
- `/dashboard/employer/applications/[id]`

## 8. State management approach

Use Zustand only for client-wide state:

- authenticated user summary
- loading auth state
- notification count
- UI sidebar state if needed

Server state should come from API calls and can later move to TanStack Query if the project grows.

## 9. Design system approach

Style direction:

- clean blue corporate UI
- white backgrounds
- blue primary actions
- subtle gradients on hero/dashboard cards
- rounded cards
- soft borders
- readable spacing

Suggested colors:

- primary: blue-600
- primary hover: blue-700
- background: slate-50
- card: white
- text: slate-900
- muted: slate-500

Use shadcn/ui for:

- Button
- Card
- Input
- Textarea
- Select
- Dialog
- Badge
- Tabs
- Table
- Dropdown Menu
- Toast/Sonner
- Skeleton

## 10. Deployment considerations

- Vercel for Next.js.
- Neon or Supabase for PostgreSQL.
- File uploads need external storage in production.
- Environment variables must be configured in Vercel.
- Prisma migrations should run before deployment or through a deployment command.

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@host:5432/careerwave"
JWT_ACCESS_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOAD_PROVIDER="local"
```

## 11. Seed strategy

Seed data should include:

- 5 job seeker accounts
- 5 employer accounts
- 5 company profiles
- 20 to 30 job listings
- sample applications across statuses
- sample bookmarks
- sample notifications

This makes the project demo-ready immediately.

## 12. Security considerations

- Hash passwords with bcrypt.
- Store refresh tokens hashed, never raw.
- Rotate refresh tokens.
- Use HTTP-only cookies.
- Validate all input with Zod.
- Check ownership on every employer action.
- Prevent duplicate applications with a unique constraint.
- Validate upload MIME type and file size.
- Never expose password hashes or refresh token hashes.
- Add basic rate limiting to auth routes.
- Use centralized API error handling.
- Use Prisma queries with strict `where` ownership checks.
