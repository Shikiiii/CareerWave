import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { env } from "@/lib/env";
import { safeFileName } from "@/lib/security/upload";

export type StoredUpload = {
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
};

function normalizeFolder(folder: string) {
  return folder
    .split("/")
    .map((part) => safeFileName(part))
    .filter(Boolean)
    .join("/");
}

function shouldUseVercelBlob() {
  if (env.FILE_STORAGE_DRIVER === "vercel-blob") return true;
  if (env.FILE_STORAGE_DRIVER === "local") return false;

  // "auto" keeps local development simple, while Vercel automatically uses Blob
  // once the Blob integration injects BLOB_READ_WRITE_TOKEN.
  return Boolean(process.env.VERCEL || env.BLOB_READ_WRITE_TOKEN);
}

async function saveToLocalPublicFolder(file: File, folder: string): Promise<StoredUpload> {
  const safeFolder = normalizeFolder(folder);
  const uploadRoot = path.join(process.cwd(), env.UPLOAD_DIR, safeFolder);
  await mkdir(uploadRoot, { recursive: true });

  const originalName = safeFileName(file.name || "upload");
  const fileName = `${Date.now()}-${randomUUID()}-${originalName}`;
  const diskPath = path.join(uploadRoot, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, buffer, { flag: "wx" });

  return {
    originalName: file.name || originalName,
    fileName,
    fileUrl: `/uploads/${safeFolder}/${fileName}`,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

async function saveToVercelBlob(file: File, folder: string): Promise<StoredUpload> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Vercel Blob is enabled, but BLOB_READ_WRITE_TOKEN is missing. Create a Blob store in Vercel Storage and connect it to this project.",
    );
  }

  const safeFolder = normalizeFolder(folder);
  const originalName = safeFileName(file.name || "upload");
  const fileName = `${Date.now()}-${randomUUID()}-${originalName}`;
  const pathname = `${safeFolder}/${fileName}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    originalName: file.name || originalName,
    fileName: pathname,
    fileUrl: blob.url,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}

export async function saveUpload(file: File, folder: string): Promise<StoredUpload> {
  if (shouldUseVercelBlob()) {
    return saveToVercelBlob(file, folder);
  }

  return saveToLocalPublicFolder(file, folder);
}
