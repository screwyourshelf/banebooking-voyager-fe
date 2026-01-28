import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerDto } from "@/types";

type OppdaterBrukerPayload = {
    brukerId: string;
    rolle: string;
    visningsnavn: string;
};

export function useAdminBrukere(slug?: string) {
    const queryClient = useQueryClient();

    const brukereKey = ["admin-brukere", slug] as const;

    // GET: hent alle brukere (admin)
    const brukereQuery = useApiQuery<BrukerDto[]>(
        brukereKey,
        `/klubb/${slug}/bruker/admin/bruker`,
        {
            enabled: !!slug,
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

    const oppdater = async (
        brukerId: string,
        data: { rolle: string; visningsnavn: string }
    ) => {
        if (!slug) return;

        await oppdaterMutation.mutateAsync({
            brukerId,
            rolle: data.rolle,
            visningsnavn: data.visningsnavn,
        });
    };

    return {
        brukere: brukereQuery.data ?? [],
        laster: brukereQuery.isLoading,

        // kan brukes til å disable lagre-knapp per rad etc.
        oppdaterLaster: oppdaterMutation.isPending,

        oppdater,
        hentBrukere: brukereQuery.refetch,

        error: brukereQuery.error?.message ?? null,
    };
}
