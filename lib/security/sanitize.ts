const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_DANGEROUS_CHARS: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
};

export function normalizeText(value: string, maxLength = 5000) {
  return value.replace(CONTROL_CHARS, "").trim().slice(0, maxLength);
}

export function escapeHtml(value: string) {
  return value.replace(/[<>&"']/g, (char) => HTML_DANGEROUS_CHARS[char] ?? char);
}

export function sanitizeText(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return value;
  return escapeHtml(normalizeText(value, maxLength));
}

export function sanitizeObject<T>(input: T, maxLength = 5000): T {
  if (typeof input === "string") return sanitizeText(input, maxLength) as T;
  if (Array.isArray(input)) return input.map((item) => sanitizeObject(item, maxLength)) as T;
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizeObject(value, maxLength)]),
    ) as T;
  }
  return input;
}
