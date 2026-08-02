import { useCallback, useEffect, useRef } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerRespons } from "@/types";
import { AKTIV_VILKAAR } from "@/features/policy/pages/vilkaar";
import { useAuth } from "@/hooks/useAuth";
import { useSlug } from "@/hooks/useSlug";

export function useBruker() {
  const slug = useSlug();
  const { currentUser } = useAuth();

  const brukerQuery = useApiQuery<BrukerRespons | null>(["bruker", slug], `/klubb/${slug}/bruker`, {
    staleTime: 60_000,
    requireAuth: true,
    enabled: !!slug && !!currentUser,
  });

  const vilkaarMutation = useApiMutation<{ versjon: string }, void>(
    "post",
    `/klubb/${slug}/bruker/vilkaar`,
    {
      onSettled: () => {
        void brukerQuery.refetch();
      },
    }
  );

  const harForsoktVilkaarRef = useRef(false);

  const mutateVilkaar = useCallback(() => {
    vilkaarMutation.mutate({ versjon: AKTIV_VILKAAR.versjon });
  }, [vilkaarMutation]);

  useEffect(() => {
    const data = brukerQuery.data;
    if (!data || brukerQuery.isLoading) return;

    if (data.vilkårAkseptertDato) {
      harForsoktVilkaarRef.current = false;
      return;
    }

    if (!harForsoktVilkaarRef.current && !vilkaarMutation.isPending) {
      harForsoktVilkaarRef.current = true;
      mutateVilkaar();
    }
  }, [brukerQuery.data, brukerQuery.isLoading, vilkaarMutation.isPending, mutateVilkaar]);

  return {
    bruker: brukerQuery.data ?? null,
    laster: brukerQuery.isLoading,
    isFetching: brukerQuery.isFetching,
    feil: brukerQuery.error ? brukerQuery.error.message : null,
    refetch: brukerQuery.refetch,
  };
}
