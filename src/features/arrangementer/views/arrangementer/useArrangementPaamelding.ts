import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ArrangementPaameldingRespons, ArrangementRespons } from "@/types";

type PaameldingVars = { arrangementId: string };

export function useArrangementPaamelding() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["arrangementer", slug] });
    void queryClient.invalidateQueries({ queryKey: ["paameldte", slug] });
  };

  const meldPaaMutation = useApiMutation<PaameldingVars, ArrangementPaameldingRespons>(
    "post",
    ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}/paamelding`,
    {
      onSuccess: () => {
        toast.success("Du er påmeldt!");
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke melde på.");
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
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke melde av.");
      },
      onSettled: invalidate,
    }
  );

  return {
    onMeldPaa: (arr: ArrangementRespons) => meldPaaMutation.mutate({ arrangementId: arr.id }),
    onMeldAv: (arr: ArrangementRespons) => meldAvMutation.mutate({ arrangementId: arr.id }),
  };
}
