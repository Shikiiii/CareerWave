import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  const safeDetails = isProduction && status >= 500 ? undefined : details;

  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(safeDetails ? { details: safeDetails } : {}),
    },
    { status },
  );
}

export function apiMethodNotAllowed(methods: string[]) {
  const response = apiError(`Method not allowed. Use ${methods.join(", ")}.`, 405);
  response.headers.set("Allow", methods.join(", "));
  return response;
}
