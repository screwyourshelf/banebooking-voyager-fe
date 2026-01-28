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

            const cfg: AxiosRequestConfig = { requireAuth: true, ...axiosConfig };

            if (method === "delete") {
                const res = await api.delete<TResult>(resolvedUrl, { ...cfg, data: payload });
                return res.data;
            }

            const res = await api[method]<TResult>(resolvedUrl, payload, cfg);
            return res.data;
        },
        ...options,
        retry: false,
    });
}
