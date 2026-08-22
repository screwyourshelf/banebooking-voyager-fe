import { ApiError, pickApiErrorMessage } from "./api-error";
import { createUnauthorizedHandler } from "./unauthorized";

export type ApiClientOptions = {
  fetch: typeof globalThis.fetch;
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<void>;
  timeoutMs?: number;
};

export type ApiRequestOptions<TBody = unknown> = {
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  headers?: HeadersInit;
  json?: TBody;
  body?: BodyInit | null;
  signal?: AbortSignal;
};

export type ApiClient = {
  request<TResponse, TBody = never>(
    path: string,
    options?: ApiRequestOptions<TBody>
  ): Promise<TResponse>;
};

const DEFAULT_TIMEOUT_MS = 20_000;

export function createApiClient(options: ApiClientOptions): ApiClient {
  const handleUnauthorized = createUnauthorizedHandler(options.onUnauthorized);

  return {
    async request<TResponse, TBody = never>(
      path: string,
      requestOptions: ApiRequestOptions<TBody> = {}
    ): Promise<TResponse> {
      const { controller, cleanup, didTimeout } = createRequestSignal(
        requestOptions.signal,
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS
      );

      try {
        const headers = new Headers(requestOptions.headers);
        const token = await options.getAccessToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);

        let body = requestOptions.body;
        if (requestOptions.json !== undefined) {
          if (body !== undefined) {
            throw new ApiError("API-kall kan ikke bruke både json og body");
          }
          headers.set("Content-Type", "application/json");
          body = JSON.stringify(requestOptions.json);
        }

        const response = await options.fetch(joinApiUrl(options.baseUrl, path), {
          method: requestOptions.method ?? "GET",
          headers,
          body,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            try {
              await handleUnauthorized();
            } catch {
              // Utloggingsadapteren skal ikke skjule den autoritative HTTP-feilen.
            }
          }
          throw await normalizeHttpError(response);
        }

        return (await parseSuccessResponse(response)) as TResponse;
      } catch (error) {
        if (error instanceof ApiError) throw error;

        if (isAbortError(error)) {
          throw new ApiError(
            didTimeout() ? "Forespørselen tok for lang tid" : "Forespørselen ble avbrutt",
            { code: didTimeout() ? "timeout" : "aborted", cause: error }
          );
        }

        throw new ApiError(error instanceof Error ? error.message : "Nettverksfeil", {
          code: "network_error",
          cause: error,
        });
      } finally {
        cleanup();
      }
    },
  };
}

export function joinApiUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return normalizedBase ? `${normalizedBase}/${normalizedPath}` : `/${normalizedPath}`;
}

async function normalizeHttpError(response: Response): Promise<ApiError> {
  const payload = await readResponsePayload(response);
  const fallback = response.statusText || (response.status === 401 ? "Uautorisert" : "Ukjent feil");

  return new ApiError(pickApiErrorMessage(payload) ?? fallback, {
    status: response.status,
    code: "http_error",
  });
}

async function parseSuccessResponse(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined;

  const body = await response.text();
  if (!body) return undefined;

  const contentType = response.headers.get("content-type")?.toLocaleLowerCase() ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    return JSON.parse(body);
  }

  return body;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type")?.toLocaleLowerCase() ?? "";
  try {
    const body = await response.text();
    if (!body) return null;
    return contentType.includes("json") ? JSON.parse(body) : body;
  } catch {
    return null;
  }
}

function createRequestSignal(parentSignal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;

  const abortFromParent = () => controller.abort(parentSignal?.reason);
  if (parentSignal?.aborted) abortFromParent();
  else parentSignal?.addEventListener("abort", abortFromParent, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    controller,
    didTimeout: () => timedOut,
    cleanup: () => {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "name" in error && error.name === "AbortError"
  );
}
