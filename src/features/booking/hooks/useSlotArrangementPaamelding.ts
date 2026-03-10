import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ArrangementPaameldingRespons, KalenderSlotRespons } from "@/types";

type PaameldingVars = { arrangementId: string };

export function useSlotArrangementPaamelding(dato: string, baneId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["bookinger", slug, baneId, dato] });
  };

  const meldPaaMutation = useApiMutation<PaameldingVars, ArrangementPaameldingRespons>(
    "post",
    ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    {
      onSuccess: () => {
        toast.success("Du er påmeldt!");
      },
      onSettled: invalidate,
    }
  );

  const meldAvMutation = useApiMutation<PaameldingVars, ArrangementPaameldingRespons>(
    "delete",
    ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    {
      onSuccess: () => {
        toast.success("Du er avmeldt.");
      },
      onSettled: invalidate,
    }
  );

  return {
    onMeldPaa: (slot: KalenderSlotRespons) => {
      if (slot.arrangementId) meldPaaMutation.mutate({ arrangementId: slot.arrangementId });
    },
    onMeldAv: (slot: KalenderSlotRespons) => {
      if (slot.arrangementId) meldAvMutation.mutate({ arrangementId: slot.arrangementId });
    },
    paameldingFeil: meldPaaMutation.error,
    avmeldingFeil: meldAvMutation.error,
  };
}
