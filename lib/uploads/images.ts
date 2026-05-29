import { saveUpload, type StoredUpload } from "@/lib/uploads/storage";

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

export type StoredImageUpload = StoredUpload;

export async function validateCompanyLogo(file: File) {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    throw new Error("Company logo must be a PNG, JPG, WEBP, or SVG image.");
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error("Company logo must be smaller than 2MB.");
  }
}

export async function saveCompanyLogo(file: File): Promise<StoredImageUpload> {
  await validateCompanyLogo(file);
  return saveUpload(file, "companies/logos");
}
