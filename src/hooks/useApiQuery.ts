import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import api from "@/api/api";

type UrlOrBuilder = string | (() => string);

type ApiQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    "queryKey" | "queryFn"
> & {
    requireAuth?: boolean;
};

export function useApiQuery<TData>(
    queryKey: QueryKey,
    url: UrlOrBuilder,
    options?: ApiQueryOptions<TData>
) {
    const requireAuth = options?.requireAuth ?? false;

    return useQuery<TData, Error>({
        queryKey,
        queryFn: async () => {
            const resolvedUrl = typeof url === "function" ? url() : url;
            const res = await api.get<TData>(resolvedUrl, { requireAuth });
            return res.data;
        },
        ...options,
    });
}
