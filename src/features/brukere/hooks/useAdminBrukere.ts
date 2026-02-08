import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerRespons } from "@/types";
import { useSlug } from "@/hooks/useSlug";

type OppdaterBrukerPayload = {
  brukerId: string;
  rolle: string;
  visningsnavn: string;
};

export function useAdminBrukere() {
  const slug = useSlug();
  const queryClient = useQueryClient();

  const brukereKey = ["admin-brukere", slug] as const;

  // GET: hent alle brukere (admin)
  const brukereQuery = useApiQuery<BrukerRespons[]>(
    brukereKey,
    `/klubb/${slug}/bruker/admin/bruker`,
    {
      requireAuth: true,
      staleTime: 30_000,
    }
  );

  // PUT: oppdater bruker (rolle + visningsnavn)
  const oppdaterMutation = useApiMutation<OppdaterBrukerPayload, void>(
    "put",
    ({ brukerId }) => `/klubb/${slug}/bruker/admin/bruker/${brukerId}`,
    {
      onSuccess: async () => {
        toast.success("Bruker oppdatert");
        await queryClient.invalidateQueries({ queryKey: brukereKey });
      },
      onError: (err) => toast.error(err.message ?? "Kunne ikke oppdatere bruker"),
      retry: false,
    }
  );

  const oppdater = async (brukerId: string, data: { rolle: string; visningsnavn: string }) => {
    await oppdaterMutation.mutateAsync({
      brukerId,
      rolle: data.rolle,
      visningsnavn: data.visningsnavn,
    });
  };

  return {
    brukere: brukereQuery.data ?? [],
    laster: brukereQuery.isLoading,
    oppdaterLaster: oppdaterMutation.isPending,
    oppdater,
    hentBrukere: brukereQuery.refetch,
    error: brukereQuery.error?.message ?? null,
  };
}
