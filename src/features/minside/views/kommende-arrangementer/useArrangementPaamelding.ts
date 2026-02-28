import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import { useQueryClient } from "@tanstack/react-query";
import type { ArrangementPaameldingRespons } from "@/types";

export function useArrangementPaamelding(arrangementId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["kommende-arrangementer", slug] });
  };

  const meldPaa = useApiMutation<void, ArrangementPaameldingRespons>(
    "post",
    `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    { onSuccess: invalidate }
  );

  const meldAv = useApiMutation<void, ArrangementPaameldingRespons>(
    "delete",
    `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    { onSuccess: invalidate }
  );

  return { meldPaa, meldAv };
}
