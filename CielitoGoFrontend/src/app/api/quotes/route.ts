import { NextResponse } from "next/server";

import { ApiError, quoteRequestSchema, submitQuote } from "@/lib/api";

export const runtime = "nodejs";

const validationResponse = (details: { field?: string; message: string }[]) =>
  NextResponse.json(
    {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Revisa los datos de la solicitud.",
      details,
    },
    { status: 400 },
  );

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationResponse([{ message: "El cuerpo JSON no es válido." }]);
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationResponse(
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || undefined,
        message: issue.message,
      })),
    );
  }

  try {
    const result = await submitQuote(parsed.data, request.signal);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message:
            status >= 500
              ? "No pudimos enviar la solicitud en este momento. Inténtalo más tarde."
              : error.message,
          ...(error.details ? { details: error.details } : {}),
        },
        { status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "QUOTE_SUBMISSION_ERROR",
        message: "No pudimos enviar la solicitud en este momento.",
      },
      { status: 502 },
    );
  }
}
