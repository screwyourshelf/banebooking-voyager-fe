import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { KlubbRespons, OppdaterKlubbForespørsel } from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useKlubb() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const klubbQuery = useApiQuery<KlubbRespons>(["klubb", slug], `/klubb/${slug}`, {
    requireAuth: false,
    enabled: !!slug,
    staleTime: Infinity,
  });

  const oppdaterKlubbMutation = useApiMutation<OppdaterKlubbForespørsel, void>(
    "put",
    `/klubb/${slug}`,
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["klubb", slug] });
        void queryClient.invalidateQueries({ queryKey: ["feed", slug] });
      },
    }
  );

  return {
    data: klubbQuery.data,
    isLoading: klubbQuery.isLoading,
    isFetching: klubbQuery.isFetching,
    error: klubbQuery.error,
    refetch: klubbQuery.refetch,

    // mutation
    oppdaterKlubb: oppdaterKlubbMutation.mutateAsync,
    oppdaterKlubbLaster: oppdaterKlubbMutation.isPending,
    oppdaterKlubbFeil: oppdaterKlubbMutation.error,
    oppdaterKlubbLagret: oppdaterKlubbMutation.isSuccess,
    resetOppdaterKlubb: oppdaterKlubbMutation.reset,
  };
}
