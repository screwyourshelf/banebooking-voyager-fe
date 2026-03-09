import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { TurneringPaameldingListeRespons } from "@/types";

export function usePaameldinger(turneringId: string, klasseId: string) {
  const slug = useSlug();

  return useApiQuery<TurneringPaameldingListeRespons>(
    ["paameldinger", slug, turneringId, klasseId],
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding`,
    {
      requireAuth: true,
      staleTime: 30_000,
    }
  );
}
