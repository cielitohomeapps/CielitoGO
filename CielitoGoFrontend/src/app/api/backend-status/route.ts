import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WAKE_TIMEOUT_MS = 75_000;

const response = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });

export async function GET(request: Request) {
  const configured = process.env.API_BASE_URL?.trim();
  if (!configured) {
    return response({ ready: false, code: "API_NOT_CONFIGURED" }, 503);
  }

  let healthUrl: URL;
  try {
    const baseUrl = new URL(configured);
    if (!["http:", "https:"].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
      throw new Error("Invalid API URL");
    }
    healthUrl = new URL("/health", baseUrl.origin);
  } catch {
    return response({ ready: false, code: "INVALID_API_CONFIGURATION" }, 503);
  }

  const startedAt = Date.now();
  try {
    const backendResponse = await fetch(healthUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(WAKE_TIMEOUT_MS),
      ]),
    });

    if (!backendResponse.ok) {
      return response({
        ready: false,
        code: "BACKEND_NOT_READY",
        elapsedMs: Date.now() - startedAt,
      }, 503);
    }

    revalidatePath("/");
    return response({
      ready: true,
      elapsedMs: Date.now() - startedAt,
    }, 200);
  } catch (error) {
    const timedOut = error instanceof DOMException
      && ["AbortError", "TimeoutError"].includes(error.name);
    return response({
      ready: false,
      code: timedOut ? "BACKEND_WAKE_TIMEOUT" : "BACKEND_UNAVAILABLE",
      elapsedMs: Date.now() - startedAt,
    }, timedOut ? 504 : 503);
  }
}
