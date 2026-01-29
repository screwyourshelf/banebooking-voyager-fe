import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import api from "@/api/api";

type ApiPostQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    "queryKey" | "queryFn" | "enabled"
> & {
    enabled?: boolean;
    requireAuth?: boolean;
    axiosConfig?: AxiosRequestConfig;
};

function stripCustomOptions<TData>(
    options?: ApiPostQueryOptions<TData>
): Omit<ApiPostQueryOptions<TData>, "requireAuth" | "axiosConfig" | "enabled"> | undefined {
    if (!options) return undefined;

    // Lag en kopi og slett feltene – ingen ubrukte variabler => ESLint happy
    const copy: Record<string, unknown> = { ...options };
    delete copy.requireAuth;
    delete copy.axiosConfig;
    delete copy.enabled;

    return copy as Omit<ApiPostQueryOptions<TData>, "requireAuth" | "axiosConfig" | "enabled">;
}

export function useApiPostQuery<TData, TBody>(
    queryKey: QueryKey,
    url: string,
    body: TBody | null,
    options?: ApiPostQueryOptions<TData>
) {
    const enabled = (options?.enabled ?? true) && body != null;
    const requireAuth = options?.requireAuth ?? true;

    const rqOptions = stripCustomOptions(options);

    return useQuery<TData, Error>({
        queryKey,
        enabled,
        retry: false,
        ...rqOptions,

        queryFn: async ({ signal }) => {
            const res = await api.post<TData>(url, body as TBody, {
                requireAuth,
                signal,
                timeout: 20_000,
                ...(options?.axiosConfig ?? {}),
            });

            return res.data;
        },
    });
}
