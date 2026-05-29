import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import { safeFileName } from "@/lib/security/upload";

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

export type StoredImageUpload = {
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
};

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

  const safeFolder = "companies/logos";
  const uploadRoot = path.join(process.cwd(), env.UPLOAD_DIR, safeFolder);
  await mkdir(uploadRoot, { recursive: true });

  const originalName = safeFileName(file.name || "company-logo");
  const fileName = `${Date.now()}-${randomUUID()}-${originalName}`;
  const diskPath = path.join(uploadRoot, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, buffer, { flag: "wx" });

  return {
    originalName: file.name || originalName,
    fileName,
    fileUrl: `/uploads/${safeFolder}/${fileName}`,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}
