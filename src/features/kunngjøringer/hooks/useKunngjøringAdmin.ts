import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import type { KunngjøringAdminRespons } from "@/features/kunngjøringer/types/kunngjøring";

export interface OpprettKunngjøringForespørsel {
  tittel: string;
  tekst: string;
  utløperTidspunkt: string;
}

export function useKunngjøringAdmin() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const kunngjøringKey = ["kunngjøring-aktiv", slug] as const;
  const brukerKey = ["bruker", slug] as const;

  const aktivQuery = useApiQuery<KunngjøringAdminRespons | null>(
    kunngjøringKey,
    `/klubb/${slug}/kunngjøringer/aktiv`,
    { requireAuth: true, staleTime: 30_000 }
  );

  const opprettMutation = useApiMutation<OpprettKunngjøringForespørsel, KunngjøringAdminRespons>(
    "post",
    `/klubb/${slug}/kunngjøringer`,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: kunngjøringKey });
        await queryClient.invalidateQueries({ queryKey: brukerKey });
      },
      retry: false,
    }
  );

  const deaktiverMutation = useApiMutation<string, void>(
    "delete",
    (id: string) => `/klubb/${slug}/kunngjøringer/${id}`,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: kunngjøringKey });
        await queryClient.invalidateQueries({ queryKey: brukerKey });
      },
      retry: false,
    }
  );

  return {
    aktiv: aktivQuery.data ?? null,
    laster: aktivQuery.isLoading,
    isFetching: aktivQuery.isFetching,
    error: aktivQuery.error,
    refetch: aktivQuery.refetch,

    opprett: (forespørsel: OpprettKunngjøringForespørsel) =>
      opprettMutation.mutateAsync(forespørsel),
    opprettLaster: opprettMutation.isPending,
    opprettFeil: opprettMutation.error,

    deaktiver: (id: string) => deaktiverMutation.mutateAsync(id),
    deaktiverLaster: deaktiverMutation.isPending,
    deaktiverFeil: deaktiverMutation.error,
  };
}
