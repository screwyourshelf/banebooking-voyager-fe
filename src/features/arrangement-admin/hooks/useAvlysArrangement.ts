import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

import type { SlettArrangementRespons } from "@/types";

/**
 * Kaller DELETE /api/klubb/{slug}/arrangement/{arrangementId}.
 * Sletter arrangementet og alle tilknyttede bookinger.
 */
export function useAvlysArrangement(arrangementId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const mutation = useApiMutation<void, SlettArrangementRespons>(
    "delete",
    `/klubb/${slug}/arrangement/${arrangementId}`,
    {
      onSuccess: async (result) => {
        toast.success(
          `Arrangement avlyst. ${result.antallBookingerSlettet} booking${result.antallBookingerSlettet === 1 ? "" : "er"} slettet.`
        );
        await queryClient.invalidateQueries({ queryKey: ["arrangementer-admin", slug] });
      },
      retry: false,
    }
  );

  return {
    avlys: () => mutation.mutateAsync(undefined as unknown as void),
    isLoading: mutation.isPending,
    feil: mutation.error,
  };
}
