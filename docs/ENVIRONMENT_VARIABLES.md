# Environment variables

## Required

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string used by Prisma |
| `JWT_ACCESS_SECRET` | random 64+ chars | Signs short-lived access tokens |
| `JWT_REFRESH_SECRET` | random 64+ chars | Signs/validates refresh token flow |
| `NEXT_PUBLIC_APP_URL` | `https://careerwave.eu` | Public base URL used by frontend links |
| `NEXT_PUBLIC_APP_DOMAIN` | `careerwave.eu` | Public app domain metadata |
| `NEXT_PUBLIC_APP_NAME` | `CareerWave` | Public app name |

## Recommended production variables

| Variable | Example | Purpose |
|---|---|---|
| `DIRECT_URL` | `postgresql://...` | Direct DB URL for migrations, when provider requires it |
| `NODE_ENV` | `production` | Enables secure production cookie behavior |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `MAX_UPLOAD_MB` | `5` | Upload size limit |
| `WRITE_RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `WRITE_RATE_LIMIT_MAX` | `120` | General API request cap |
| `AUTH_RATE_LIMIT_MAX` | `10` | Auth endpoint request cap |

## Generate JWT secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use different values for access and refresh secrets.

## Local example

```env
NODE_ENV="development"
NEXT_PUBLIC_APP_NAME="CareerWave"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerwave"
JWT_ACCESS_SECRET="local-access-secret-change-me"
JWT_REFRESH_SECRET="local-refresh-secret-change-me"
JWT_ISSUER="careerwave.eu"
JWT_AUDIENCE="careerwave-web"
UPLOAD_DIR="uploads"
MAX_UPLOAD_MB="5"
```

## Production example

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_NAME="CareerWave"
NEXT_PUBLIC_APP_URL="https://careerwave.eu"
NEXT_PUBLIC_APP_DOMAIN="careerwave.eu"
DATABASE_URL="postgresql://...sslmode=require"
DIRECT_URL="postgresql://...sslmode=require"
JWT_ACCESS_SECRET="64-char-random-secret"
JWT_REFRESH_SECRET="64-char-random-secret"
JWT_ISSUER="careerwave.eu"
JWT_AUDIENCE="careerwave-web"
UPLOAD_DIR="uploads"
MAX_UPLOAD_MB="5"
```
