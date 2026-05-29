# CareerWave deployment guide

This guide deploys CareerWave to Vercel with PostgreSQL.

## Recommended production architecture

```txt
Browser
  ↓
Vercel / Next.js App Router
  ↓
Next.js API routes
  ↓
Prisma Client
  ↓
PostgreSQL provider
```

Recommended database providers:

- Neon Postgres
- Supabase Postgres
- Prisma Postgres
- Any managed PostgreSQL provider with SSL support

For Vercel/serverless deployments, a pooled runtime connection is recommended when your provider supports it. Some providers also provide a direct connection string for migration commands.

Official references used while preparing this guide:

- Vercel Postgres/storage marketplace docs: https://vercel.com/docs/postgres
- Prisma production migrations: https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate
- Neon + Prisma connection guidance: https://neon.tech/docs/guides/prisma

## 1. Prepare GitHub repository

```bash
git init
git add .
git commit -m "Initial CareerWave project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerwave.git
git push -u origin main
```

## 2. Create production PostgreSQL database

Create a new PostgreSQL project in Neon, Supabase, Prisma Postgres, or another provider.

Create/copy:

- `DATABASE_URL` for runtime application queries
- `DIRECT_URL` if your provider separates runtime pooled connections from direct migration connections

## 3. Configure environment variables in Vercel

In Vercel:

```txt
Project -> Settings -> Environment Variables
```

Add the variables from:

```txt
.env.production.example
```

Required production variables:

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="CareerWave"
NEXT_PUBLIC_APP_URL="https://careerwave.eu"
NEXT_PUBLIC_APP_DOMAIN="careerwave.eu"
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_ISSUER="careerwave.eu"
JWT_AUDIENCE="careerwave-web"
```

Optional but recommended:

```env
DIRECT_URL="postgresql://..."
MAX_UPLOAD_MB="5"
AUTH_RATE_LIMIT_MAX="10"
```

## 4. Connect project to Vercel

1. Open Vercel dashboard.
2. Click **Add New Project**.
3. Import the GitHub repository.
4. Framework should be detected as **Next.js**.
5. Build command uses `npm run vercel-build` from `vercel.json`.
6. Add environment variables.
7. Deploy.

## 5. Apply production database migrations

Prisma production migrations should use:

```bash
npx prisma migrate deploy
```

Recommended approach:

```bash
DATABASE_URL="your-production-database-url" npm run db:deploy
```

If the provider requires a direct migration URL, temporarily set `DATABASE_URL` to the direct URL for the migration command, or configure the Prisma datasource to use `directUrl = env("DIRECT_URL")` if you extend the schema later.

Do **not** use `prisma migrate dev` against production.

## 6. Seed demo data

For a university demo environment only:

```bash
DATABASE_URL="your-production-database-url" npm run db:seed
```

Do not seed fake accounts into a real public production environment.

## 7. Configure careerwave.eu

In Vercel:

```txt
Project -> Settings -> Domains -> Add careerwave.eu
```

Then update DNS at your domain provider using Vercel's shown records.

Common setup:

```txt
A record for root domain
CNAME for www
```

Once DNS is verified, Vercel automatically provisions HTTPS.

## 8. Verify production

Open:

```txt
https://careerwave.eu
```

Check:

- Homepage loads
- Register works
- Login works
- Jobs API returns data
- Employer dashboard loads for employer accounts
- Job seeker dashboard loads for job seeker accounts
- Applications can be submitted
- Application statuses update
- Notifications appear

## 9. Important upload note

The current local upload implementation is acceptable for demo/local use. Vercel serverless file systems are not suitable for persistent user uploads. Before real public production, replace local uploads with persistent object storage.

Recommended upgrade options:

- Vercel Blob
- UploadThing
- Supabase Storage
- AWS S3 compatible storage

## 10. Final deployment commands

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run db:deploy
```
