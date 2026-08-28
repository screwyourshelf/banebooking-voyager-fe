import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import { getFeedStatus } from "./api";
import { sessionQueryKeys } from "./query-keys";

export function feedStatusQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "news"),
    queryKey: sessionQueryKeys.feedStatus(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getFeedStatus(api, slug, signal),
    staleTime: 10 * 60_000,
  };
}
