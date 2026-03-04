import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SlettArrangementRespons, ArrangementRespons } from "@/types";

type AvlysVars = { arrangementId: string };

export function useAvlysArrangement() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["arrangementer", slug] });
    void queryClient.invalidateQueries({ queryKey: ["paameldte", slug] });
  };

  const avlysMutation = useApiMutation<AvlysVars, SlettArrangementRespons>(
    "delete",
    ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}`,
    {
      onSuccess: (result) => {
        toast.success(`Arrangement avlyst – ${result.antallBookingerSlettet} bookinger fjernet.`);
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke avlyse arrangement.");
      },
      onSettled: invalidate,
    }
  );

  return {
    onAvlys: (arr: ArrangementRespons) => avlysMutation.mutateAsync({ arrangementId: arr.id }),
  };
}
