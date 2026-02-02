import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { KlubbDetaljer, OppdaterKlubb } from "@/types/index";
import { useSlug } from "@/hooks/useSlug";

export function useKlubb() {
    const slug = useSlug();
    const queryClient = useQueryClient();

    // GET klubb
    const klubbQuery = useApiQuery<KlubbDetaljer>(
        ["klubb", slug],
        `/klubb/${slug}`,
        {
            requireAuth: false,
            staleTime: 1000 * 60 * 5, // 5 min
        }
    );

    // Toast på query-feil
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

    // PUT klubb
    const oppdaterKlubb = useApiMutation<OppdaterKlubb, void>(
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
        oppdaterKlubb,
    };
}
