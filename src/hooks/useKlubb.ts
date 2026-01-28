import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { KlubbDetaljer, OppdaterKlubb } from "@/types/index.js";

export function useKlubb(slug?: string) {
    const queryClient = useQueryClient();

    // GET klubb
    const klubbQuery = useApiQuery<KlubbDetaljer>(
        ["klubb", slug],
        `/klubb/${slug}`,
        {
            requireAuth: false,
            enabled: !!slug,
            staleTime: 1000 * 60 * 5, // 5 min
        }
    );

    // Toast på query-feil (v5 pattern)
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

    // PUT/PATCH klubb (bruker det endepunktet dere har i api/klubb)
    // Hvis backend krever auth: sett requireAuth: true i api/klubb.ts eller her via mutationFn.
    const oppdaterKlubb = useApiMutation<OppdaterKlubb, void>(
        "put",
        `/klubb/${slug}`,
        {
            onSuccess: () => {
                toast.success("Klubb oppdatert");
                queryClient.invalidateQueries({ queryKey: ["klubb", slug] });
                queryClient.invalidateQueries({ queryKey: ["feed", slug] });
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
        oppdaterKlubb,
    };
}
