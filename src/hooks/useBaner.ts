import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import api from "@/api/api";
import type { Bane, NyBane, OppdaterBane } from "@/types";

export function useBaner(slug?: string, inkluderInaktive = true) {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        if (!slug) return;
        queryClient.invalidateQueries({ queryKey: ["baner", slug] });
        queryClient.invalidateQueries({ queryKey: ["baner", slug, true] });
        queryClient.invalidateQueries({ queryKey: ["baner", slug, false] });
    };

    const banerQuery = useApiQuery<Bane[]>(
        ["baner", slug, inkluderInaktive],
        `/klubb/${slug}/baner${inkluderInaktive ? "?inkluderInaktive=true" : ""}`,
        {
            enabled: !!slug,
            staleTime: 1000 * 60 * 5,
            requireAuth: false,
        }
    );

    const errorToastetRef = useRef(false);
    useEffect(() => {
        if (!banerQuery.error) {
            errorToastetRef.current = false;
            return;
        }
        if (errorToastetRef.current) return;

        toast.error(banerQuery.error.message ?? "Kunne ikke hente baner");
        errorToastetRef.current = true;
    }, [banerQuery.error]);

    const opprettBane = useApiMutation<NyBane, void>(
        "post",
        `/klubb/${slug}/baner`,
        {
            onSuccess: () => {
                toast.success("Bane opprettet");
                invalidateAll();
            },
            onError: (err) => toast.error(err.message ?? "Kunne ikke opprette bane"),
        }
    );

    // Oppdater bane: her trenger vi fortsatt id i URL.
    // Enten:
    // A) behold custom mutationFn (som nå)
    // B) eller oppgrader useApiMutation til å støtte url som funksjon.
    const oppdaterBane = useApiMutation<{ id: string; dto: OppdaterBane }, void>(
        "put",
        "/",
        {
            mutationFn: async ({ id, dto }) => {
                if (!slug) return;
                await api.put<void>(`/klubb/${slug}/baner/${id}`, dto, { requireAuth: true });
            },
            onSuccess: () => {
                toast.success("Bane oppdatert");
                invalidateAll();
            },
            onError: (err) => toast.error(err.message ?? "Kunne ikke oppdatere bane"),
        }
    );

    return {
        baner: banerQuery.data ?? [],
        isLoading: banerQuery.isLoading,
        error: banerQuery.error,
        refetch: banerQuery.refetch,

        opprettBane,
        oppdaterBane,
    };
}
