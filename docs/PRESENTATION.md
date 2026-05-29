# CareerWave presentation notes

## 1. Project introduction

CareerWave is a modern job portal inspired by jobs.bg. It connects job seekers with employers and covers the full basic recruitment flow: job posting, job discovery, application submission, employer review, applicant status management, and interview/contact notes.

## 2. Problem being solved

Many job platforms need two different experiences:

- A simple browsing and application flow for candidates
- A structured dashboard for employers reviewing many applications

CareerWave demonstrates both sides in one full-stack system.

## 3. Main roles

### Job seeker

- Creates an account
- Completes profile
- Uploads CV/documents
- Searches and filters jobs
- Applies to jobs
- Tracks application status
- Withdraws applications
- Saves jobs

### Employer

- Registers a firm account
- Maintains company profile
- Creates job listings
- Manages listings
- Reviews applicants
- Accepts/rejects applications
- Adds interview/contact notes

## 4. Application status flow

```txt
SUBMITTED -> REVIEWING -> ACCEPTED
                      -> REJECTED
SUBMITTED/REVIEWING -> WITHDRAWN
```

When an employer opens a submitted application, the system automatically changes it to `REVIEWING`.

## 5. Architecture summary

CareerWave uses Next.js App Router for both frontend and backend. The frontend is built from server/client React components and Tailwind styled UI components. Backend functionality is implemented through Next.js API routes. Data is stored in PostgreSQL and accessed with Prisma.

## 6. Database design

The database separates authentication users from role-specific data:

- `User` stores login identity and role
- `UserProfile` stores job seeker profile data
- `Employer` and `CompanyProfile` store employer/company data
- `JobListing` stores jobs
- `Application` connects users and jobs
- `UploadedDocument` stores CVs and attachments
- `Bookmark` stores saved jobs
- `Notification` stores user notifications
- `InterviewNote` stores employer interview/contact notes

## 7. Security highlights

- Passwords are hashed with bcrypt
- JWT access and refresh token flow
- Refresh token storage and rotation
- Role-based route protection
- Employer ownership checks
- Upload validation
- Input validation with Zod
- API error wrappers and rate limiting helpers

## 8. Demo flow

Recommended live demo:

1. Open homepage and show job search/filtering.
2. Open a job details page.
3. Login as a job seeker.
4. Upload CV or show profile CV.
5. Apply to a job.
6. Open job seeker dashboard and show application status.
7. Login as employer.
8. Open applicants dashboard.
9. Open the application; show status changing to reviewing.
10. Accept the applicant.
11. Show accepted tab and interview notes.

## 9. Tech stack justification

Next.js makes the project easy to deploy on Vercel and keeps frontend/backend in one codebase. Prisma gives typed database queries and migrations. PostgreSQL is reliable for relational data like users, jobs, and applications. TailwindCSS and shadcn-style components allow fast creation of a polished UI.

## 10. Future improvements

- Real email notifications
- Persistent cloud object storage
- Employer verification
- Admin dashboard
- AI CV/job matching
- Real calendar interview scheduling
- Multi-language Bulgarian/English support
