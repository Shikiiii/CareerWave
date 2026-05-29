# Vercel company logo storage fix

The project has two different kinds of company logos:

1. **Seed/demo logos** shipped with the source code.
2. **Runtime uploaded logos** uploaded from `/employer/company`.

Runtime uploads should use Vercel Blob on Vercel when:

```env
FILE_STORAGE_DRIVER="vercel-blob"
BLOB_READ_WRITE_TOKEN="..."
```

Seed logos should not live under `public/uploads`, because `public/uploads/*` is intentionally gitignored for local runtime uploads. Demo logos were moved to:

```txt
public/demo-company-logos
```

The seed script now stores `/demo-company-logos/*.svg` paths. For already-seeded databases that still contain old `/uploads/company-logos/*.svg` values, `resolveCompanyLogoUrl()` maps those legacy paths to the committed demo logo directory at render time.
