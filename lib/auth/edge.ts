import type { AuthRole } from "@/types/auth";

export type EdgeAccessTokenPayload = {
  sub: string;
  email: string;
  role: AuthRole;
  type: "access";
  aud?: string;
  iss?: string;
  exp?: number;
  nbf?: number;
};

function base64UrlToUint8Array(input: string): Uint8Array {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeStringEquals(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyAccessTokenEdge(
  token: string,
  secret: string,
  options?: { issuer?: string; audience?: string },
): Promise<EdgeAccessTokenPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !signature) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const expectedSignature = await crypto.subtle.sign("HMAC", key, data);
    const expectedBase64Url = uint8ArrayToBase64Url(new Uint8Array(expectedSignature));

    if (!timingSafeStringEquals(expectedBase64Url, signature)) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedPayload))) as EdgeAccessTokenPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.type !== "access") return null;
    if (payload.exp && payload.exp < now) return null;
    if (payload.nbf && payload.nbf > now) return null;
    if (options?.issuer && payload.iss !== options.issuer) return null;
    if (options?.audience && payload.aud !== options.audience) return null;

    return payload;
  } catch {
    return null;
  }
}
