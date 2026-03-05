import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import api from "@/api/api";

type UrlOrBuilder<TPayload> = string | ((payload: TPayload) => string);

type ApiMutationOptions<TPayload, TResult, TContext> = UseMutationOptions<
  TResult,
  Error,
  TPayload,
  TContext
> & {
  getBody?: (payload: TPayload) => unknown;
};

export function useApiMutation<TPayload = unknown, TResult = void, TContext = unknown>(
  method: "post" | "put" | "patch" | "delete",
  url: UrlOrBuilder<TPayload>,
  options?: ApiMutationOptions<TPayload, TResult, TContext>,
  axiosConfig?: AxiosRequestConfig
) {
  const getBody = options?.getBody;

  const rqOptions = (() => {
    if (!options) return undefined;
    const copy: Record<string, unknown> = { ...options };
    delete copy.getBody;
    return copy as UseMutationOptions<TResult, Error, TPayload, TContext>;
  })();

  return useMutation<TResult, Error, TPayload, TContext>({
    mutationFn: async (payload: TPayload) => {
      const resolvedUrl = typeof url === "function" ? url(payload) : url;
      const body = getBody ? getBody(payload) : payload;

      // Default: requireAuth = true, men allow override fra caller via axiosConfig
      const cfg: AxiosRequestConfig = { requireAuth: true, ...axiosConfig };

      if (method === "delete") {
        // Send body bare hvis body faktisk finnes
        const hasBody = body !== undefined && body !== null;

        const res = await api.delete<TResult>(resolvedUrl, hasBody ? { ...cfg, data: body } : cfg);

        return res.data;
      }

      const res = await api[method]<TResult>(resolvedUrl, body, cfg);
      return res.data;
    },

    // Viktig: caller sin options skal kunne overstyre retry hvis ønskelig.
    // Default: retry false
    retry: false,
    ...rqOptions,
  });
}
