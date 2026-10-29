export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorDetail[];

  constructor({
    status,
    code,
    message,
    details,
    cause,
  }: {
    status: number;
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiContractError extends ApiError {
  constructor(message: string, cause?: unknown) {
    super({
      status: 502,
      code: "INVALID_API_RESPONSE",
      message,
      cause,
    });
    this.name = "ApiContractError";
  }
}
