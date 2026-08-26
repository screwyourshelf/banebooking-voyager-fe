import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import { getNews } from "./api";
import { newsQueryKeys } from "./query-keys";

export function newsQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "news"),
    queryKey: newsQueryKeys.all(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getNews(api, slug, signal),
    staleTime: 5 * 60_000,
  };
}
