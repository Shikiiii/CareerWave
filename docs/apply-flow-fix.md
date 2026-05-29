# Apply flow Prisma relation fix

Fixed `app/api/applications/route.ts`.

The application route creates `UploadedDocument` records nested under `Application`.
`UploadedDocument` also has a required `user` relation, so each nested document create now connects the current job seeker user.

This fixes the runtime error:

`Argument user is missing`
