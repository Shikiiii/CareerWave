import path from "path";
import { env } from "@/lib/env";

export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

export function safeFileName(name: string) {
  const baseName = path.basename(name || "document");
  return baseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120) || "document";
}

export async function validateUploadedDocument(file: File, label = "File") {
  const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  const extension = path.extname(file.name || "").toLowerCase();

  if (file.size <= 0) throw new Error(`${label} is empty.`);
  if (file.size > maxBytes) throw new Error(`${label} must be smaller than ${env.MAX_UPLOAD_MB}MB.`);
  if (!ALLOWED_EXTENSIONS.has(extension)) throw new Error(`${label} must use a .pdf, .doc, or .docx extension.`);

  // Some browsers/OS combinations upload local documents as an empty MIME type or
  // application/octet-stream. The extension + magic-number checks below are the
  // important validation, so only reject MIME types when the browser provides a
  // specific unsupported value.
  const browserMimeType = file.type || "";
  const genericMimeTypes = new Set(["", "application/octet-stream"]);
  if (!genericMimeTypes.has(browserMimeType) && !ALLOWED_DOCUMENT_MIME_TYPES.has(browserMimeType)) {
    throw new Error(`${label} must be a PDF, DOC, or DOCX file.`);
  }

  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
  const isZipBasedDocx = header[0] === 0x50 && header[1] === 0x4b;
  const isLegacyDoc = header[0] === 0xd0 && header[1] === 0xcf && header[2] === 0x11 && header[3] === 0xe0;

  if (extension === ".pdf" && !isPdf) throw new Error(`${label} does not look like a valid PDF file.`);
  if (extension === ".docx" && !isZipBasedDocx) throw new Error(`${label} does not look like a valid DOCX file.`);
  if (extension === ".doc" && !isLegacyDoc) throw new Error(`${label} does not look like a valid DOC file.`);
}
