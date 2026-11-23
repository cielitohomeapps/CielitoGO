import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getBackendUrl,
  sessionMaxAge,
} from "@/lib/admin/session";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const expectedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }

  let credentials: unknown;
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ message: "Envía correo y contraseña válidos." }, { status: 400 });
  }

  const body = credentials && typeof credentials === "object" ? (credentials as Record<string, unknown>) : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password || password.length > 128) {
    return NextResponse.json({ message: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(getBackendUrl("/api/auth/login"), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await backendResponse.json()) as Record<string, unknown>;
    if (!backendResponse.ok || typeof result.token !== "string") {
      const message = typeof result.message === "string"
        ? result.message
        : typeof result.error === "string"
          ? result.error
          : "No fue posible iniciar sesión.";
      return NextResponse.json({ message }, { status: backendResponse.status });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set(ADMIN_SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionMaxAge(result.token),
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el backend. Confirma que esté ejecutándose." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Solicitud no autorizada." }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
