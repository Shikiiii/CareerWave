import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";
import { safeFileName, validateUploadedDocument } from "@/lib/security/upload";

export const MAX_DOCUMENT_SIZE_BYTES = env.MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_EXTRA_DOCUMENTS = 5;

export type StoredUpload = {
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
};

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

  const safeFolder = safeUploadFolder(folder);
  const uploadRoot = path.join(process.cwd(), env.UPLOAD_DIR, safeFolder);
  await mkdir(uploadRoot, { recursive: true });

  const originalName = safeFileName(file.name || "document");
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
