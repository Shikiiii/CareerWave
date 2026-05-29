# Architecture explanation

## Overview

CareerWave is a monolithic full-stack web application built with Next.js App Router. It keeps the user interface and backend API in the same repository, which makes it easier to understand, deploy, and present as a university project.

```txt
Next.js App Router
├── Public pages
├── Job seeker dashboard
├── Employer dashboard
└── API routes
    ├── Auth
    ├── Jobs
    ├── Applications
    ├── Employer management
    ├── Documents
    ├── Bookmarks
    └── Notifications
```

## Frontend architecture

The frontend is organized by feature:

- `components/auth` for login/register UI
- `components/jobs` for job cards and filters
- `components/account` for job seeker dashboard features
- `components/employer` for employer dashboard features
- `components/layout` for navbar/sidebar/footer/dashboard shell
- `components/shared` for reusable empty states, dialogs, loading states, and page headings
- `components/ui` for low-level UI primitives

## Backend architecture

Backend routes live in `app/api`.

Important route groups:

- `app/api/auth/*` handles registration, login, logout, refresh, and current user
- `app/api/jobs` handles public job browsing
- `app/api/applications` handles job application creation
- `app/api/account/*` handles job seeker profile, documents, applications, and bookmarks
- `app/api/employer/*` handles employer jobs, stats, and applicant review
- `app/api/notifications/*` handles notifications

## Auth architecture

CareerWave uses a JWT-based flow:

1. User logs in with email/password.
2. Server validates bcrypt password hash.
3. Server issues a short-lived access token.
4. Server issues a longer-lived refresh token.
5. Refresh token is stored server-side as a hash.
6. Protected API routes validate token/session.
7. Role guards enforce job seeker/employer access.

## Data access

Prisma Client is created through a singleton helper to avoid unnecessary clients during development hot reloads.

Database logic is split into:

- `lib/prisma.ts`
- `lib/db/*`
- `lib/employer/*`
- feature-specific API route handlers

## Security architecture

Security helpers live in `lib/security` and `lib/auth`.

They handle:

- API error formatting
- Rate limiting helpers
- Input sanitization
- Upload validation
- Cookie handling
- Token creation/verification
- Role checks

## Upload architecture

The current project uses a local upload abstraction. This is fine for local demos and university presentation. In real production on Vercel, user files should be moved to persistent object storage.

Recommended production upload providers:

- Vercel Blob
- Supabase Storage
- UploadThing
- S3-compatible storage

## Deployment architecture

Vercel hosts the Next.js app. PostgreSQL is hosted externally or through Vercel Marketplace integration. Environment variables connect the application to the database and configure secrets.
