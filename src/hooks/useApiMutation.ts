import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import api from "@/api/api";

type UrlOrBuilder<TPayload> = string | ((payload: TPayload) => string);

export function useApiMutation<TPayload = unknown, TResult = void, TContext = unknown>(
  method: "post" | "put" | "patch" | "delete",
  url: UrlOrBuilder<TPayload>,
  options?: UseMutationOptions<TResult, Error, TPayload, TContext>,
  axiosConfig?: AxiosRequestConfig
) {
  return useMutation<TResult, Error, TPayload, TContext>({
    mutationFn: async (payload: TPayload) => {
      const resolvedUrl = typeof url === "function" ? url(payload) : url;

      // Default: requireAuth = true, men allow override fra caller via axiosConfig
      const cfg: AxiosRequestConfig = { requireAuth: true, ...axiosConfig };

      if (method === "delete") {
        // Send body bare hvis payload faktisk finnes
        const hasBody = payload !== undefined && payload !== null;

        const res = await api.delete<TResult>(
          resolvedUrl,
          hasBody ? { ...cfg, data: payload } : cfg
        );

        return res.data;
      }

      const res = await api[method]<TResult>(resolvedUrl, payload, cfg);
      return res.data;
    },

    // Viktig: caller sin options skal kunne overstyre retry hvis ønskelig.
    // Default: retry false
    retry: false,
    ...options,
  });
}
