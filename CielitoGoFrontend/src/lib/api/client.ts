import type { ZodType } from "zod";

import { ApiContractError, ApiError, type ApiErrorDetail } from "./errors";

const DEFAULT_TIMEOUT_MS = 8_000;

type NextRequestOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  timeoutMs?: number;
};

const getApiBaseUrl = () => {
  const configured = process.env.API_BASE_URL?.trim();
  if (!configured) {
    throw new ApiError({
      status: 503,
      code: "API_NOT_CONFIGURED",
      message: "El servicio todavía no está configurado.",
    });
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configured);
  } catch (cause) {
    throw new ApiError({
      status: 503,
      code: "INVALID_API_CONFIGURATION",
      message: "La configuración del servicio no es válida.",
      cause,
    });
  }

  if (
    !["http:", "https:"].includes(baseUrl.protocol) ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new ApiError({
      status: 503,
      code: "INVALID_API_CONFIGURATION",
      message: "La configuración del servicio no es válida.",
    });
  }

  return baseUrl;
};

const buildApiUrl = (path: string) => {
  if (!path.startsWith("/api/") || path.startsWith("//")) {
    throw new ApiError({
      status: 500,
      code: "INVALID_API_PATH",
      message: "La ruta solicitada no es válida.",
    });
  }

  const baseUrl = getApiBaseUrl();
  return new URL(path, `${baseUrl.origin}/`);
};

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiContractError("El backend devolvió un formato inesperado.");
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new ApiContractError("No fue posible interpretar la respuesta.", cause);
  }
};

const parseError = (status: number, body: unknown) => {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const details = Array.isArray(record.details)
      ? record.details.filter(
          (item): item is ApiErrorDetail =>
            Boolean(
              item &&
                typeof item === "object" &&
                typeof (item as Record<string, unknown>).message === "string",
            ),
        )
      : undefined;

    if (typeof record.message === "string") {
      return new ApiError({
        status,
        code:
          typeof record.code === "string" ? record.code : "BACKEND_REQUEST_ERROR",
        message: record.message,
        details,
      });
    }

    if (typeof record.error === "string") {
      return new ApiError({
        status,
        code: "BACKEND_REQUEST_ERROR",
        message: record.error,
      });
    }
  }

  return new ApiError({
    status,
    code: "BACKEND_REQUEST_ERROR",
    message: "No fue posible completar la solicitud.",
  });
};

export async function apiRequest<T>(
  path: string,
  schema: ZodType<T>,
  options: NextRequestOptions = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, signal, ...requestInit } =
    options;
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const composedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...requestInit,
      headers: {
        Accept: "application/json",
        ...headers,
      },
      signal: composedSignal,
    });
  } catch (cause) {
    if (
      cause instanceof DOMException &&
      ["AbortError", "TimeoutError"].includes(cause.name)
    ) {
      throw new ApiError({
        status: 504,
        code: "API_TIMEOUT",
        message: "El servicio tardó demasiado en responder.",
        cause,
      });
    }

    if (cause instanceof ApiError) throw cause;

    throw new ApiError({
      status: 503,
      code: "API_UNAVAILABLE",
      message: "El servicio no está disponible temporalmente.",
      cause,
    });
  }

  const body = await parseBody(response);
  if (!response.ok) throw parseError(response.status, body);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiContractError(
      "La respuesta del backend no cumple el contrato esperado.",
      parsed.error,
    );
  }

  return parsed.data;
}
