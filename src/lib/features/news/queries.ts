import type { ApiClient } from "$lib/platform/api";
import { getNews } from "./api";
import { newsQueryKeys } from "./query-keys";

export function newsQueryOptions(api: ApiClient, slug: string) {
  return {
    queryKey: newsQueryKeys.all(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getNews(api, slug, signal),
    staleTime: 60_000,
  };
}
