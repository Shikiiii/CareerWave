const LEGACY_UPLOAD_LOGO_PREFIX = "/uploads/company-logos/";
const DEMO_LOGO_PREFIX = "/demo-company-logos/";

const SEEDED_LOGO_MAP: Record<string, string> = {
  "knpp.svg": "kozloduy_npp.jpg",
  "k.svg": "kaufland.png",
  "billa.svg": "billa.jpg",
  "luk.svg": "lukoil.jpg",
  "dsk.svg": "dsk_bank.jpg",
  "viva.svg": "vivacom.png",
  "nek.svg": "nec_national_electricity_company.jpg",
  "aur.svg": "aurubis_bulgaria.jpg",
  "sop.svg": "sopharma.svg",
  "bdz.svg": "bulgarian_state_railways_bdz.png",
};

/**
 * Seeded demo logos are committed static files under /public/demo-company-logos.
 * Older database rows may still point to generated placeholder SVG names, either
 * under /uploads/company-logos or /demo-company-logos. This helper maps those
 * legacy paths to the real logo files supplied for the project.
 *
 * Real uploaded logos are absolute Vercel Blob URLs and are returned unchanged.
 */
export function resolveCompanyLogoUrl(logoUrl?: string | null) {
  if (!logoUrl) return null;

  const isLegacyUploadLogo = logoUrl.startsWith(LEGACY_UPLOAD_LOGO_PREFIX);
  const isDemoLogo = logoUrl.startsWith(DEMO_LOGO_PREFIX);

  if (isLegacyUploadLogo || isDemoLogo) {
    const fileName = logoUrl.split("/").pop() ?? "";
    const mappedFileName = SEEDED_LOGO_MAP[fileName] ?? fileName;
    return `${DEMO_LOGO_PREFIX}${mappedFileName}`;
  }

  return logoUrl;
}
