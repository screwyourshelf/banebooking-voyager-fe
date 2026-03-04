import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

import type { SlettArrangementRespons } from "@/types";

type AvlysVars = { arrangementId: string };

export function useAvlysArrangement() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const avlysMutation = useApiMutation<AvlysVars, SlettArrangementRespons>(
    "delete",
    ({ arrangementId }) => `/klubb/${slug}/arrangement/${arrangementId}`,
    {
      onSuccess: (result) => {
        toast.success(`Arrangement avlyst – ${result.antallBookingerSlettet} bookinger fjernet.`);
        void queryClient.invalidateQueries({ queryKey: ["aktiveArrangementer", slug] });
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke avlyse arrangement.");
      },
    }
  );

  return {
    avlys: (arrangementId: string) => avlysMutation.mutateAsync({ arrangementId }),
  };
}
