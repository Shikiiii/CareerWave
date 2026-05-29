# PostgreSQL setup

CareerWave uses PostgreSQL through Prisma ORM.

## Local PostgreSQL with Docker

```bash
docker run --name careerwave-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=careerwave \
  -p 5432:5432 \
  -d postgres:16
```

Local `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerwave"
```

Apply migrations:

```bash
npx prisma migrate dev
```

Seed data:

```bash
npm run db:seed
```

## Neon setup

1. Create a Neon project.
2. Copy the pooled connection string for `DATABASE_URL`.
3. Copy the direct connection string for migration operations if available.
4. Add both to Vercel environment variables.

Example:

```env
DATABASE_URL="postgresql://user:pass@ep-example-pooler.region.aws.neon.tech/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-example.region.aws.neon.tech/db?sslmode=require"
```

## Supabase setup

1. Create a Supabase project.
2. Open Project Settings -> Database.
3. Copy the connection string.
4. Replace `[YOUR-PASSWORD]`.
5. Add it as `DATABASE_URL`.

## Production migration rule

Development:

```bash
npx prisma migrate dev
```

Production:

```bash
npx prisma migrate deploy
```

Use `migrate deploy` because it applies already-created migrations without generating new development artifacts.
