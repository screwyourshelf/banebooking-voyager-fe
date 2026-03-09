import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { DrawVisningRespons } from "@/types";

export function useDraw(turneringId: string, klasseId: string, enabled: boolean) {
  const slug = useSlug();

  return useApiQuery<DrawVisningRespons>(
    ["draw", slug, turneringId, klasseId],
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/draw`,
    {
      requireAuth: true,
      staleTime: 30_000,
      enabled,
    }
  );
}
