import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { OppdaterPaameldingSeedForespørsel, TurneringPaameldingRespons } from "@/types";

type Payload = OppdaterPaameldingSeedForespørsel & { paameldingId: string };

export function useOppdaterPaameldingSeed(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
  };

  return useApiMutation<Payload, TurneringPaameldingRespons>(
    "put",
    ({ paameldingId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${paameldingId}/seed`,
    {
      getBody: (payload) => ({ seed: payload.seed }),
      onSuccess: () => {
        toast.success("Seed oppdatert");
        invalidate();
      },
    }
  );
}
