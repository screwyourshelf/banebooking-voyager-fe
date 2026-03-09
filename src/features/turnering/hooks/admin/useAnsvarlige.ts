import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { TurneringAnsvarligeRespons } from "@/types";

export function useAnsvarlige(turneringId: string) {
  const slug = useSlug();

  return useApiQuery<TurneringAnsvarligeRespons>(
    ["turneringAnsvarlige", slug, turneringId],
    `/klubb/${slug}/turnering/${turneringId}/ansvarlig`,
    {
      requireAuth: true,
      staleTime: 60_000,
    }
  );
}
