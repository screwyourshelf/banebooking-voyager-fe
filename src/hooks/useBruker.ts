import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerDto } from "@/types";
import { AKTIV_VILKAAR } from "@/lib/vilkaar";
import { useAuth } from "@/hooks/useAuth";


export function useBruker(slug?: string) {
    const { currentUser } = useAuth();
    const authKey = currentUser?.id ?? "anon";

    const brukerQuery = useApiQuery<BrukerDto | null>(
        ["bruker", slug, authKey],
        `/klubb/${slug}/bruker`,
        {
            enabled: !!slug,
            staleTime: 60_000,
            requireAuth: true,
        }
    );

    const vilkaarMutation = useApiMutation<{ versjon: string }, void>(
        "post",
        `/klubb/${slug}/bruker/vilkaar`,
        {
            onError: (err) => {
                console.warn("Feil ved oppdatering av vilkår:", err);
            },
            onSettled: () => {
                void brukerQuery.refetch();
            },
        }
    );

    const harForsoktVilkaarRef = useRef(false);

    useEffect(() => {
        if (!slug) return;
        if (!brukerQuery.data) return;
        if (brukerQuery.isLoading) return;

        if (brukerQuery.data.vilkaarAkseptertDato) {
            harForsoktVilkaarRef.current = false;
            return;
        }

        if (!harForsoktVilkaarRef.current && !vilkaarMutation.isPending) {
            harForsoktVilkaarRef.current = true;
            vilkaarMutation.mutate({ versjon: AKTIV_VILKAAR.versjon });
        }
    }, [slug, brukerQuery.data, brukerQuery.isLoading, vilkaarMutation]);

    const toastetFeilRef = useRef(false);
    useEffect(() => {
        if (!brukerQuery.error) {
            toastetFeilRef.current = false;
            return;
        }
        if (toastetFeilRef.current) return;

        toast.error(brukerQuery.error.message ?? "Kunne ikke hente bruker");
        toastetFeilRef.current = true;
    }, [brukerQuery.error]);

    return {
        bruker: brukerQuery.data ?? null,
        laster: brukerQuery.isLoading,
        feil: brukerQuery.error ? brukerQuery.error.message : null,
        refetch: brukerQuery.refetch,
    };
}
