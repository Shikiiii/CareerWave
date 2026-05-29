const LEGACY_SEEDED_LOGO_PREFIX = "/uploads/company-logos/";
const STATIC_DEMO_LOGO_PREFIX = "/demo-company-logos/";

/**
 * Demo logos were originally seeded as /uploads/company-logos/*.svg.
 * That folder is gitignored because it is meant for runtime uploads, so those
 * static seed images disappear on Vercel. Keep old database rows working by
 * mapping only those seeded logo paths to committed static assets.
 *
 * Real uploaded logos should be stored as absolute Vercel Blob URLs and are
 * returned unchanged.
 */
export function resolveCompanyLogoUrl(logoUrl?: string | null) {
  if (!logoUrl) return null;

  if (logoUrl.startsWith(LEGACY_SEEDED_LOGO_PREFIX)) {
    return logoUrl.replace(LEGACY_SEEDED_LOGO_PREFIX, STATIC_DEMO_LOGO_PREFIX);
  }

  return logoUrl;
}
