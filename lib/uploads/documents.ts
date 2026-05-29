import { env } from "@/lib/env";
import { safeFileName, validateUploadedDocument } from "@/lib/security/upload";
import { saveUpload, type StoredUpload } from "@/lib/uploads/storage";

export const MAX_DOCUMENT_SIZE_BYTES = env.MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_EXTRA_DOCUMENTS = 5;

export type { StoredUpload };

export async function validateApplicationFile(file: File, label = "File") {
  await validateUploadedDocument(file, label);
}

function safeUploadFolder(folder: string) {
  return folder
    .split("/")
    .map((part) => safeFileName(part))
    .filter(Boolean)
    .join("/");
}

export async function saveUploadedDocument(file: File, folder = "applications"): Promise<StoredUpload> {
  await validateApplicationFile(file);
  return saveUpload(file, safeUploadFolder(folder));
}
