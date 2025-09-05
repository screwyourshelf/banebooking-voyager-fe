import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { hentFeed } from "@/api/feed.js";
import type { FeedItemDto } from "@/types/index.js";

/**
 * Hook for å hente feed-oppføringer for en gitt klubb.
 *
 * @param slug Klubbindentifikator (fra URL eller context)
 */
export function useFeed(slug: string | undefined) {
  return useQuery<FeedItemDto[], Error>({
    queryKey: ["feed", slug],
    queryFn: () => hentFeed(slug!),
    enabled: !!slug,
    staleTime: 60_000, // 1 minutt: regnes som "fersk" før den hentes på nytt
    onError: (err) => {
      toast.error(err.message ?? "Kunne ikke hente feed");
    },
  });
}
