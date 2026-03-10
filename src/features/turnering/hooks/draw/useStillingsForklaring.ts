import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { StillingsForklaringRespons } from "@/types";

export function useStillingsForklaring(
  turneringId: string,
  klasseId: string,
  gruppeId: string,
  enabled: boolean
) {
  const slug = useSlug();

  return useApiQuery<StillingsForklaringRespons>(
    ["stillingsForklaring", slug, turneringId, klasseId, gruppeId],
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/gruppe/${gruppeId}/stilling/forklaring`,
    {
      requireAuth: true,
      staleTime: 30_000,
      enabled,
    }
  );
}
