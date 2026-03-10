import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerSperrerRespons, SperrBrukerForespørsel } from "@/types";
import { useSlug } from "@/hooks/useSlug";

type SperrPayload = { brukerId: string } & SperrBrukerForespørsel;

type OpphevPayload = {
  brukerId: string;
  sperreId: string;
};

export function useBrukerSperrer(brukerId: string, enabled: boolean) {
  const slug = useSlug();

  return useApiQuery<BrukerSperrerRespons>(
    ["bruker-sperrer", slug, brukerId],
    `/klubb/${slug}/bruker/admin/bruker/${brukerId}/sperr`,
    {
      requireAuth: true,
      enabled,
      staleTime: 30_000,
    }
  );
}

export function useAdminBrukersperre() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const brukereKey = ["admin-brukere", slug];

  const sperrMutation = useApiMutation<SperrPayload, void>(
    "post",
    ({ brukerId }) => `/klubb/${slug}/bruker/admin/bruker/${brukerId}/sperr`,
    {
      getBody: ({ type, årsak, aktivTil }) => ({ type, årsak, aktivTil }),
      onSuccess: async (_, payload) => {
        toast.success("Bruker sperret");
        await queryClient.invalidateQueries({ queryKey: brukereKey });
        await queryClient.invalidateQueries({
          queryKey: ["bruker-sperrer", slug, payload.brukerId],
        });
      },
      retry: false,
    }
  );

  const opphevMutation = useApiMutation<OpphevPayload, void>(
    "delete",
    ({ brukerId, sperreId }) => `/klubb/${slug}/bruker/admin/bruker/${brukerId}/sperr/${sperreId}`,
    {
      getBody: () => undefined,
      onSuccess: async (_, payload) => {
        toast.success("Sperre opphevet");
        await queryClient.invalidateQueries({ queryKey: brukereKey });
        await queryClient.invalidateQueries({
          queryKey: ["bruker-sperrer", slug, payload.brukerId],
        });
      },
      retry: false,
    }
  );

  const sperr = async (brukerId: string, data: SperrBrukerForespørsel) => {
    await sperrMutation.mutateAsync({ brukerId, ...data });
  };

  const opphev = async (brukerId: string, sperreId: string) => {
    await opphevMutation.mutateAsync({ brukerId, sperreId });
  };

  return {
    sperr,
    opphev,
    sperrLaster: sperrMutation.isPending,
    opphevLaster: opphevMutation.isPending,
    sperrFeil: sperrMutation.error,
    opphevFeil: opphevMutation.error,
  };
}
