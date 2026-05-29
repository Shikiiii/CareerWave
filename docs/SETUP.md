# CareerWave Initial Setup

## 1. Create the project

If starting from zero manually:

```bash
npx create-next-app@latest careerwave --typescript --eslint --app --src-dir=false --tailwind --import-alias "@/*"
cd careerwave
```

This generated package is already scaffolded, so you can start from the zip directly.

## 2. Install dependencies

```bash
npm install
```

Main packages included:

```bash
npm install @prisma/client bcryptjs jsonwebtoken zod axios zustand react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-separator
npm install -D prisma tsx typescript @types/node @types/react @types/react-dom @types/bcryptjs @types/jsonwebtoken eslint eslint-config-next tailwindcss postcss autoprefixer
```

## 3. shadcn/ui setup

The `components.json` file is already included.

Manual setup command:

```bash
npx shadcn@latest init
```

Recommended components to add later:

```bash
npx shadcn@latest add button input label card badge dialog dropdown-menu select tabs toast avatar separator skeleton textarea
```

## 4. Environment setup

Copy the local env template:

```bash
cp .env.local.example .env.local
```

Update `DATABASE_URL` for your PostgreSQL instance.

Example local PostgreSQL URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/careerwave?schema=public"
```

## 5. Prisma setup

Generate Prisma client:

```bash
npx prisma generate
```

Create and apply migration later:

```bash
npx prisma migrate dev --name init
```

Open Prisma Studio:

```bash
npx prisma studio
```

## 6. Run dev server

```bash
npm run dev
```

## 7. Folder structure created

```text
app/
  api/health/route.ts
  layout.tsx
  page.tsx
components/
  layout/
  ui/
config/
  site.ts
docs/
  ARCHITECTURE.md
  SETUP.md
hooks/
lib/
  api-response.ts
  constants.ts
  env.ts
  prisma.ts
  utils.ts
prisma/
  schema.prisma
  seed.ts
public/uploads/
stores/
types/
  api.ts
  auth.ts
```
