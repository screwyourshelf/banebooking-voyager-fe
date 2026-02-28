import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { ArrangementPaameldtListeRespons } from "@/types";

export function usePaameldteListe(arrangementId: string, enabled: boolean) {
  const slug = useSlug();

  return useApiQuery<ArrangementPaameldtListeRespons>(
    ["paameldte", slug, arrangementId],
    `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    {
      requireAuth: true,
      enabled,
      staleTime: 30_000,
    }
  );
}
