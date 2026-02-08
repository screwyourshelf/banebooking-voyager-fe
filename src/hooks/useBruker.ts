import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { BrukerDto } from "@/types";
import { AKTIV_VILKAAR } from "@/features/policy/pages/vilkaar";
import { useAuth } from "@/hooks/useAuth";
import { useSlug } from "@/hooks/useSlug";

export function useBruker() {
    const slug = useSlug();
    const { currentUser } = useAuth();
    const authKey = currentUser?.id ?? "anon";

    const brukerQuery = useApiQuery<BrukerDto | null>(
        ["bruker", slug, authKey],
        `/klubb/${slug}/bruker`,
        {
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

    const mutateVilkaar = useCallback(() => {
        vilkaarMutation.mutate({ versjon: AKTIV_VILKAAR.versjon });
    }, [vilkaarMutation]);

    useEffect(() => {
        const data = brukerQuery.data;
        if (!data) return;
        if (brukerQuery.isLoading) return;

        if (data.vilkårAkseptertDato) {
            harForsoktVilkaarRef.current = false;
            return;
        }

        if (!harForsoktVilkaarRef.current && !vilkaarMutation.isPending) {
            harForsoktVilkaarRef.current = true;
            mutateVilkaar();
        }
    }, [
        brukerQuery.data,
        brukerQuery.isLoading,
        vilkaarMutation.isPending,
        mutateVilkaar,
    ]);

    const toastetFeilRef = useRef(false);

    useEffect(() => {
        const err = brukerQuery.error;
        if (!err) {
            toastetFeilRef.current = false;
            return;
        }
        if (toastetFeilRef.current) return;

        toast.error(err.message ?? "Kunne ikke hente bruker");
        toastetFeilRef.current = true;
    }, [brukerQuery.error]);

    return {
        bruker: brukerQuery.data ?? null,
        laster: brukerQuery.isLoading,
        feil: brukerQuery.error ? brukerQuery.error.message : null,
        refetch: brukerQuery.refetch,
    };
}
