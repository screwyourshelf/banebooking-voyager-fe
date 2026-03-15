import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OppdaterPaameldingDetaljerForespørsel } from "@/types";

type Payload = OppdaterPaameldingDetaljerForespørsel & { paameldingId: string };

export function useOppdaterPaameldingDetaljer(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
  };

  return useApiMutation<Payload, void>(
    "put",
    ({ paameldingId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${paameldingId}/detaljer`,
    {
      onSuccess: () => {
        toast.success("Påmelding oppdatert.");
        invalidate();
      },
    }
  );
}
