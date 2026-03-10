import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { RegistrerResultatForespørsel, KampResultatRespons } from "@/types";

type GruppePayload = RegistrerResultatForespørsel & { kampId: string };
type SluttspillPayload = RegistrerResultatForespørsel & { kampId: string };

export function useRegistrerResultat(turneringId: string, klasseId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["draw", slug, turneringId, klasseId] });
  };

  const registrerGruppekamp = useApiMutation<GruppePayload, KampResultatRespons>(
    "put",
    ({ kampId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/kamp/${kampId}/resultat`,
    {
      getBody: (payload) => ({
        vinner: payload.vinner,
        avslutning: payload.avslutning,
        sett: payload.sett,
      }),
      onSuccess: () => {
        toast.success("Resultat registrert");
        invalidate();
      },
    }
  );

  const registrerSluttspillkamp = useApiMutation<SluttspillPayload, KampResultatRespons>(
    "put",
    ({ kampId }) =>
      `/klubb/${slug}/turnering/${turneringId}/klasse/${klasseId}/sluttspillkamp/${kampId}/resultat`,
    {
      getBody: (payload) => ({
        vinner: payload.vinner,
        avslutning: payload.avslutning,
        sett: payload.sett,
      }),
      onSuccess: () => {
        toast.success("Resultat registrert");
        invalidate();
      },
    }
  );

  return { registrerGruppekamp, registrerSluttspillkamp };
}
