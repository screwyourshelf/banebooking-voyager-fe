import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import api from "@/api/api";

type UrlOrBuilder = string | (() => string);

type ApiQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    "queryKey" | "queryFn"
> & {
    requireAuth?: boolean;
    axiosConfig?: AxiosRequestConfig;
};

export function useApiQuery<TData>(
    queryKey: QueryKey,
    url: UrlOrBuilder,
    options?: ApiQueryOptions<TData>
) {
    const requireAuth = options?.requireAuth ?? false;
    const axiosConfig = options?.axiosConfig;

    // React Query options (uten våre custom-felter) – uten destrukturering-vars (ESLint)
    const rqOptions = (() => {
        if (!options) return undefined;
        const copy: Record<string, unknown> = { ...options };
        delete copy.requireAuth;
        delete copy.axiosConfig;
        return copy as Omit<ApiQueryOptions<TData>, "requireAuth" | "axiosConfig">;
    })();

    return useQuery<TData, Error>({
        queryKey,
        queryFn: async ({ signal }) => {
            const resolvedUrl = typeof url === "function" ? url() : url;

            const res = await api.get<TData>(resolvedUrl, {
                requireAuth,
                signal,
                ...(axiosConfig ?? {}),
            });

            return res.data;
        },
        ...rqOptions,
    });
}
