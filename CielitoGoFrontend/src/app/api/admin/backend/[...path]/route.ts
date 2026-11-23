import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { ADMIN_SESSION_COOKIE, getBackendUrl } from "@/lib/admin/session";

const UUID = "[0-9a-fA-F-]{36}";
const ALLOWED: Record<string, RegExp[]> = {
  GET: [
    /^dashboard\/stats$/,
    new RegExp(`^tours(?:\/${UUID})?$`),
    new RegExp(`^promotions(?:\/${UUID})?$`),
    /^quotes(?:\/[0-9a-fA-F-]{36}(?:\/history)?)?$/,
    /^reservations(?:\/[0-9a-fA-F-]{36}(?:\/history)?)?$/,
    new RegExp(`^customers(?:\/${UUID})?$`),
    /^auth\/(?:profile|users)$/,
  ],
  POST: [
    /^tours$/,
    /^promotions$/,
    /^auth\/register$/,
    new RegExp(`^quotes\/${UUID}\/convert-to-reservation$`),
    new RegExp(`^reservations\/${UUID}\/cancel$`),
  ],
  PUT: [
    new RegExp(`^(?:tours|promotions)\/${UUID}$`),
    new RegExp(`^auth\/users\/${UUID}\/(?:role|toggle)$`),
  ],
  PATCH: [
    new RegExp(`^(?:quotes|reservations)\/${UUID}(?:\/status)?$`),
  ],
  DELETE: [
    new RegExp(`^(?:tours|promotions)\/${UUID}$`),
  ],
};

function sameOrigin(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const expectedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const method = request.method.toUpperCase();
  if (method !== "GET" && !sameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }

  const segments = (await context.params).path;
  if (!segments.length || segments.some((segment) => !/^[a-zA-Z0-9_-]+$/.test(segment))) {
    return NextResponse.json({ message: "Ruta administrativa inválida." }, { status: 400 });
  }
  const path = segments.join("/");
  if (!ALLOWED[method]?.some((pattern) => pattern.test(path))) {
    return NextResponse.json({ message: "Operación administrativa no permitida." }, { status: 404 });
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Tu sesión ha expirado." }, { status: 401 });

  try {
    const target = getBackendUrl(`/api/${path}`);
    request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
    const contentType = request.headers.get("content-type");
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const backendResponse = await fetch(target, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    const responseBody = await backendResponse.arrayBuffer();
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: { "Content-Type": backendResponse.headers.get("content-type") ?? "application/json" },
    });
    if (backendResponse.status === 401) {
      response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    }
    if (backendResponse.ok && method !== "GET" && /^(?:tours|promotions)(?:\/|$)/.test(path)) {
      revalidatePath("/");
    }
    return response;
  } catch {
    return NextResponse.json({ message: "No fue posible conectar con el backend." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
