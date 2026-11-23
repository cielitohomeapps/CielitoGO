import "server-only";

import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "cielito_admin_session";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  isActive?: boolean;
  lastLogin?: string | null;
};

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "ADMIN_API_ERROR",
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

export function getBackendUrl(path: string) {
  const configured = process.env.API_BASE_URL?.trim();
  if (!configured) {
    throw new AdminApiError(
      "Configura API_BASE_URL para conectar el panel con el backend.",
      503,
      "API_NOT_CONFIGURED",
    );
  }

  const base = new URL(configured);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
    throw new AdminApiError("API_BASE_URL no es una URL válida.", 503, "INVALID_API_CONFIGURATION");
  }

  return new URL(path, `${base.origin}/`);
}

export async function getAdminToken() {
  return (await cookies()).get(ADMIN_SESSION_COOKIE)?.value ?? null;
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AdminApiError("El backend devolvió una respuesta inesperada.", response.status);
  }

  return response.json() as Promise<unknown>;
}

function messageFromBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (typeof record.error === "string") return record.error;
  return null;
}

export async function adminApiRequest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  if (!path.startsWith("/api/") || path.startsWith("//")) {
    throw new AdminApiError("Ruta administrativa inválida.", 500, "INVALID_ADMIN_PATH");
  }

  const token = await getAdminToken();
  if (!token) throw new AdminApiError("Tu sesión ha expirado.", 401, "NO_SESSION");

  let response: Response;
  try {
    response = await fetch(getBackendUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      signal: init.signal ?? AbortSignal.timeout(10_000),
    });
  } catch (error) {
    if (error instanceof AdminApiError) throw error;
    throw new AdminApiError("No fue posible conectar con el backend.", 503, "API_UNAVAILABLE");
  }

  const body = await parseResponse(response);
  if (!response.ok) {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
    throw new AdminApiError(
      messageFromBody(body) ?? "No fue posible completar la solicitud.",
      response.status,
      typeof record?.code === "string" ? record.code : "BACKEND_REQUEST_ERROR",
    );
  }

  return body as T;
}

export async function getAdminProfile(): Promise<AdminUser> {
  const result = await adminApiRequest<{ user: AdminUser }>("/api/auth/profile");
  return result.user;
}

export function sessionMaxAge(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    if (typeof decoded.exp !== "number") return undefined;
    const remaining = Math.floor(decoded.exp - Date.now() / 1000);
    return Math.max(1, Math.min(remaining, 24 * 60 * 60));
  } catch {
    return undefined;
  }
}
