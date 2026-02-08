import { useApiQuery } from "@/hooks/useApiQuery";
import type { FeedItemRespons } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useFeed() {
    const slug = useSlug();

    const query = useApiQuery<FeedItemRespons[]>(
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
