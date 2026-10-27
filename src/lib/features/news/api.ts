import type { FeedItemRespons } from "#lib/contracts/index.ts";
import type { ApiClient } from "#lib/platform/api/index.ts";

export function getNews(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<FeedItemRespons[]>(`klubb/${encodeURIComponent(slug)}/feed`, {
    auth: "none",
    signal,
  });
}
