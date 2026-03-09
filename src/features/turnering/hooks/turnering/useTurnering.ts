import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { TurneringRespons } from "@/types";

export function useTurnering(turneringId: string) {
  const slug = useSlug();

  return useApiQuery<TurneringRespons>(
    ["turnering", slug, turneringId],
    `/klubb/${slug}/turnering/${turneringId}`,
    {
      requireAuth: true,
      staleTime: 30_000,
    }
  );
}
