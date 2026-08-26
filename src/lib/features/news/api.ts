import type { FeedItemRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";

export function getNews(api: ApiClient, slug: string, signal?: AbortSignal) {
  return api.request<FeedItemRespons[]>(`klubb/${encodeURIComponent(slug)}/feed`, {
    auth: "none",
    signal,
  });
}
