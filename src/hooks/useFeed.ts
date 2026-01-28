import { useApiQuery } from "@/hooks/useApiQuery";
import type { FeedItemDto } from "@/types";

/**
 * Hook for å hente feed via React Query + Axios.
 */
export function useFeed(slug: string) {
  const query = useApiQuery<FeedItemDto[]>(
    ["feed", slug],
    `/klubb/${slug}/feed`,
    {
      requireAuth: true,
      staleTime: 60_000,
    }
  );

  return {
    feed: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
