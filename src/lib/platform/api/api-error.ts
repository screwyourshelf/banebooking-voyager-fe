export type ApiErrorCode = "aborted" | "http_error" | "network_error" | "timeout";

export type ApiErrorOptions = {
  status?: number;
  code?: ApiErrorCode;
  cause?: unknown;
};

/** Normalisert feilmodell på tvers av alle HTTP-endepunkter. */
export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: ApiErrorCode;

  constructor(message: string, options: ApiErrorOptions | number = {}) {
    const normalizedOptions = typeof options === "number" ? { status: options } : options;
    super(message, { cause: normalizedOptions.cause });
    this.name = "ApiError";
    this.status = normalizedOptions.status;
    this.code = normalizedOptions.code ?? "http_error";
  }
}

export function pickApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  for (const key of ["melding", "message", "detail", "title"] as const) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}
