# CareerWave

CareerWave is a full-stack job portal university project inspired by platforms like jobs.bg. It supports job seekers, employers, job listings, applications, CV/document uploads, bookmarks, notifications, and employer-side applicant review workflows.

Production domain target: `careerwave.eu`

## Tech stack

- **Next.js App Router** for frontend pages and backend API routes
- **TypeScript** for safer code
- **TailwindCSS** and **shadcn/ui-style components** for the blue corporate UI
- **PostgreSQL** for relational data
- **Prisma ORM** for schema, migrations, and typed database access
- **JWT authentication** with access and refresh tokens
- **bcryptjs** for password hashing
- **React Hook Form + Zod** for form validation
- **Zustand** for lightweight client auth state
- **Axios** for client API calls

## Main features

### Public users

- Browse latest and featured jobs
- Search jobs by keyword, location, company, salary, employment type, remote type, and experience level
- View full job detail pages
- Register/login as a job seeker or employer

### Job seekers

- Manage profile information
- Upload and manage CV/documents
- Apply to jobs with saved CV or newly uploaded documents
- Track application status
- Withdraw applications
- Bookmark jobs
- Receive notifications about application updates

### Employers

- Register a company account
- Create, edit, pause, reactivate, and delete job listings
- View dashboard stats
- Review applicants per job
- Opening an application changes `SUBMITTED` to `REVIEWING`
- Accept or reject applications
- Use accepted applicant tab with contact and interview notes
- Receive notifications for new applicants

## Project structure

```txt
app/                         Next.js App Router pages and API routes
app/api/                     Backend API endpoints
components/                  Reusable UI, layout, auth, job, account, employer components
config/                      Site, navigation, and theme constants
docs/                        Deployment, architecture, database, testing, and presentation docs
hooks/                       Client hooks
lib/                         Auth, database, validation, security, upload, API helpers
prisma/                      Prisma schema, migrations, and seed data
public/                      Static assets and local upload folder placeholder
stores/                      Zustand stores
types/                       Shared TypeScript types
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set at least:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerwave"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start PostgreSQL

Use a local Postgres instance, Docker, Neon, Supabase, or any compatible PostgreSQL provider.

Docker example:

```bash
docker run --name careerwave-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=careerwave \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Apply migrations

```bash
npx prisma migrate dev
```

### 5. Seed demo data

```bash
npm run db:seed
```

Seeded demo password for all generated accounts:

```txt
Password123!
```

### 6. Run the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Useful commands

```bash
npm run dev              # local development
npm run build            # production build
npm run start            # run production build locally
npm run typecheck        # TypeScript check
npm run lint             # lint
npm run check            # typecheck + lint
npm run prisma:generate  # generate Prisma client
npm run prisma:migrate   # create/apply dev migration
npm run db:deploy        # apply production migrations
npm run db:seed          # seed demo data
npm run prisma:studio    # inspect database
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Job seeker | `maria.petkova@example.com` | `Password123!` |
| Job seeker | `ivan.georgiev@example.com` | `Password123!` |
| Job seeker | `elena.stoyanova@example.com` | `Password123!` |
| Employer | `hr@bluepeak.example.com` | `Password123!` |
| Employer | `jobs@danubefintech.example.com` | `Password123!` |
| Employer | `people@northstarcloud.example.com` | `Password123!` |

## Documentation

- [`docs/SETUP.md`](docs/SETUP.md)