import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type {
  MedlemskapStatusRespons,
  MedlemskapBekreftelseRespons,
  AktiverMedlemskapBekreftelseForespørsel,
} from "@/types";
import { useSlug } from "@/hooks/useSlug";

export function useMedlemskapAdmin() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const statusKey = ["medlemskap-status", slug] as const;
  const brukerKey = ["bruker", slug] as const;

  // GET: hent status (antall bekreftet / totalt)
  const statusQuery = useApiQuery<MedlemskapStatusRespons>(
    statusKey,
    `/klubb/${slug}/medlemskap/status`,
    {
      requireAuth: true,
      staleTime: 30_000,
    }
  );

  // POST: aktiver ny bekreftelsesperiode
  const aktiverMutation = useApiMutation<
    AktiverMedlemskapBekreftelseForespørsel,
    MedlemskapBekreftelseRespons
  >("post", `/klubb/${slug}/medlemskap/aktiver`, {
    onSuccess: async () => {
      toast.success("Medlemskapbekreftelse aktivert");
      await queryClient.invalidateQueries({ queryKey: statusKey });
      await queryClient.invalidateQueries({ queryKey: brukerKey });
    },
    retry: false,
  });

  // DELETE: deaktiver aktiv bekreftelse
  const deaktiverMutation = useApiMutation<void, void>(
    "delete",
    `/klubb/${slug}/medlemskap/aktiver`,
    {
      onSuccess: async () => {
        toast.success("Medlemskapbekreftelse deaktivert");
        await queryClient.invalidateQueries({ queryKey: statusKey });
        await queryClient.invalidateQueries({ queryKey: brukerKey });
      },
      retry: false,
    }
  );

  return {
    status: statusQuery.data ?? null,
    laster: statusQuery.isLoading,
    isFetching: statusQuery.isFetching,
    error: statusQuery.error,
    refetch: statusQuery.refetch,

    aktiver: (forespørsel: AktiverMedlemskapBekreftelseForespørsel) =>
      aktiverMutation.mutateAsync(forespørsel),
    aktiverLaster: aktiverMutation.isPending,
    aktiverFeil: aktiverMutation.error,

    deaktiver: () => deaktiverMutation.mutateAsync(),
    deaktiverLaster: deaktiverMutation.isPending,
    deaktiverFeil: deaktiverMutation.error,
  };
}
