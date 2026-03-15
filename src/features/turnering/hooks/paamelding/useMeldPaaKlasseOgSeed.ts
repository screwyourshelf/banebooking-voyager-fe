import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import api from "@/api/api";
import type { MeldPaaKlasseForespørsel, TurneringPaameldingRespons } from "@/types";

type Payload = MeldPaaKlasseForespørsel & { seed?: number | null };

export function useMeldPaaKlasseOgSeed(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidatePaameldinger = () => {
    void queryClient.invalidateQueries({
      queryKey: ["paameldinger", slug, turneringId, klasseId],
    });
  };

  return useApiMutation<Payload, TurneringPaameldingRespons>(
    "post",
    `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding`,
    {
      getBody: ({ seed: _seed, ...rest }) => rest,
      onSuccess: async (data, payload) => {
        if (payload.seed != null) {
          try {
            await api.put(
              `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/paamelding/${data.id}/seed`,
              { seed: payload.seed },
              { requireAuth: true }
            );
          } catch {
            toast.error("Deltaker lagt til, men seed kunne ikke settes.");
            invalidatePaameldinger();
            return;
          }
        }
        toast.success("Deltaker lagt til");
        invalidatePaameldinger();
      },
    }
  );
}
