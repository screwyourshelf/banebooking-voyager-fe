import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import api from "@/api/api";

type ApiPostQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    "queryKey" | "queryFn"
> & {
    requireAuth?: boolean;
    axiosConfig?: AxiosRequestConfig;
};

export function useApiPostQuery<TData, TBody>(
    queryKey: QueryKey,
    url: string,
    body: TBody | null,
    options?: ApiPostQueryOptions<TData>
) {
    const requireAuth = options?.requireAuth ?? false;

    return useQuery<TData, Error>({
        queryKey,
        enabled: (options?.enabled ?? true) && body != null,
        retry: false,
        ...options,
        queryFn: async ({ signal }) => {
            const res = await api.post<TData>(url, body, {
                requireAuth,
                signal,
                timeout: 20_000,
                ...(options?.axiosConfig ?? {}),
            });
            return res.data;
        },
    });
}
