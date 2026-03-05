import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  const toastetFeilRef = useRef(false);

  useEffect(() => {
    if (!klubbQuery.error) {
      toastetFeilRef.current = false;
      return;
    }

    if (toastetFeilRef.current) return;

    toast.error(klubbQuery.error.message ?? "Kunne ikke hente klubb");
    toastetFeilRef.current = true;
  }, [klubbQuery.error]);

  const oppdaterKlubbMutation = useApiMutation<OppdaterKlubbForespørsel, void>(
    "put",
    `/klubb/${slug}`,
    {
      onSuccess: () => {
        toast.success("Klubb oppdatert");

        void queryClient.invalidateQueries({ queryKey: ["klubb", slug] });
        void queryClient.invalidateQueries({ queryKey: ["feed", slug] });
      },
      onError: (err) => {
        toast.error(err.message ?? "Kunne ikke oppdatere klubb");
      },
    }
  );

  return {
    data: klubbQuery.data,
    isLoading: klubbQuery.isLoading,
    error: klubbQuery.error,
    refetch: klubbQuery.refetch,

    // mutation
    oppdaterKlubb: oppdaterKlubbMutation.mutateAsync,
    oppdaterKlubbLaster: oppdaterKlubbMutation.isPending,
  };
}
