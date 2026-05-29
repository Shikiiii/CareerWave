# Tech stack justification

## Next.js App Router

Next.js provides frontend pages and backend API routes in one project. This is useful for a university project because deployment and structure are simpler than maintaining a separate backend server.

## TypeScript

TypeScript improves maintainability by catching many mistakes before runtime. It is especially useful with Prisma because database results and model types can be typed.

## TailwindCSS

Tailwind makes it quick to build a consistent custom design. CareerWave uses a clean blue corporate theme with reusable layouts and components.

## shadcn/ui-style components

Reusable UI primitives such as buttons, cards, dialogs, inputs, skeletons, and badges keep the interface consistent and easier to extend.

## PostgreSQL

CareerWave has strongly relational data: users, companies, jobs, applications, documents, notifications, and bookmarks. PostgreSQL is a good fit because it supports relations, constraints, indexes, enums, and JSON fields.

## Prisma ORM

Prisma provides:

- readable schema definition
- migrations
- generated TypeScript client
- safer database queries
- easier relations and includes

## JWT authentication

JWT access and refresh tokens provide a clear auth architecture. Short-lived access tokens reduce risk, while refresh tokens keep users logged in.

## bcryptjs

Passwords are never stored directly. bcrypt hashes passwords with a work factor, making leaked password hashes harder to attack.

## React Hook Form + Zod

React Hook Form keeps forms efficient and simple. Zod provides shared validation rules and clear validation errors.

## Zustand

Zustand is lightweight and fits this project better than a heavy global state library. It is used for simple client-side auth/session state.

## Axios

Axios provides a consistent API client with request/response handling. It is useful for future token refresh interceptors and error handling.

## Vercel

Vercel is a natural deployment target for Next.js. It supports Git-based deployments, environment variables, custom domains, HTTPS, and marketplace storage integrations.
