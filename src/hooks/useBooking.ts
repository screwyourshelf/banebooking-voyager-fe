import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BookingSlotRespons } from "@/types";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";

type SlotVars = { baneId: string; dato: string; startTid: string; sluttTid: string };
type OptimisticContext = { previous?: BookingSlotRespons[] };

export function useBooking(dato: string, baneId: string) {
    const slug = useSlug();
    const queryClient = useQueryClient();
    const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);

    const queryKey = ["bookinger", slug, baneId, dato] as const;

    const enabled = Boolean(baneId) && Boolean(dato);

    // GET slots
    const bookingerQuery = useApiQuery<BookingSlotRespons[]>(
        queryKey,
        `/klubb/${slug}/bookinger?baneId=${baneId}&dato=${dato}`,
        {
            requireAuth: true,
            enabled,
            staleTime: 0,
            refetchInterval: 30_000,
            refetchOnWindowFocus: true,
            refetchIntervalInBackground: false,
            placeholderData: keepPreviousData, 
        }
    );

    // Query-feil toast (�n gang per feil)
    const errorToastetRef = useRef(false);
    useEffect(() => {
        if (!bookingerQuery.error) {
            errorToastetRef.current = false;
            return;
        }
        if (errorToastetRef.current) return;

        toast.error(bookingerQuery.error.message ?? "Kunne ikke hente bookinger");
        errorToastetRef.current = true;
    }, [bookingerQuery.error]);

    const invalidateAll = () => {
        void queryClient.invalidateQueries({ queryKey });
        void queryClient.invalidateQueries({ queryKey: ["mineBookinger", slug] }); // prefix matcher begge varianter
    };

    const erSammeSlot = (s: BookingSlotRespons, v: { startTid: string; sluttTid: string }) =>
        s.startTid === v.startTid && s.sluttTid === v.sluttTid;

    // POST booking (optimistic)
    const bookMutation = useApiMutation<SlotVars, void, OptimisticContext>(
        "post",
        `/klubb/${slug}/bookinger`,
        {
            onMutate: async (vars) => {
                await queryClient.cancelQueries({ queryKey });

                const previous = queryClient.getQueryData<BookingSlotRespons[]>(queryKey);

                queryClient.setQueryData<BookingSlotRespons[]>(queryKey, (old = []) =>
                    old.map((s) =>
                        erSammeSlot(s, vars)
                            ? {
                                ...s,
                                booketAv: "Du",
                                erEier: true,
                                kanBookes: false,
                                kanAvbestille: true,
                            }
                            : s
                    )
                );

                return { previous };
            },
            onError: (err, _vars, ctx) => {
                if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
                toast.error(err.message ?? "Kunne ikke booke.");
            },
            onSuccess: (_data, vars) => {
                const tid = `${vars.startTid.slice(0, 2)}-${vars.sluttTid.slice(0, 2)}`;
                toast.success(`Booket ${tid}`);
            },
            onSettled: () => {
                invalidateAll();
            },
        }
    );

    // DELETE (avbestill) (optimistic)
    const cancelMutation = useApiMutation<SlotVars, void, OptimisticContext>(
        "delete",
        `/klubb/${slug}/bookinger`,
        {
            onMutate: async (vars) => {
                await queryClient.cancelQueries({ queryKey });

                const previous = queryClient.getQueryData<BookingSlotRespons[]>(queryKey);

                queryClient.setQueryData<BookingSlotRespons[]>(queryKey, (old = []) =>
                    old.map((s) =>
                        erSammeSlot(s, vars)
                            ? {
                                ...s,
                                booketAv: null,
                                erEier: false,
                                kanBookes: true,
                                kanAvbestille: false,
                                kanSlette: false,
                            }
                            : s
                    )
                );

                return { previous };
            },
            onError: (err, _vars, ctx) => {
                if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
                toast.error(err.message ?? "Kunne ikke avbestille.");
            },
            onSuccess: () => {
                toast.info("Bookingen er avbestilt.");
            },
            onSettled: () => {
                invalidateAll();
            },
        }
    );

    // DELETE admin (optimistic)
    const deleteMutation = useApiMutation<SlotVars, void, OptimisticContext>(
        "delete",
        `/klubb/${slug}/bookinger/admin`,
        {
            onMutate: async (vars) => {
                await queryClient.cancelQueries({ queryKey });

                const previous = queryClient.getQueryData<BookingSlotRespons[]>(queryKey);

                queryClient.setQueryData<BookingSlotRespons[]>(queryKey, (old = []) =>
                    old.map((s) =>
                        erSammeSlot(s, vars)
                            ? {
                                ...s,
                                booketAv: null,
                                erEier: false,
                                kanBookes: true,
                                kanAvbestille: false,
                                kanSlette: false,
                            }
                            : s
                    )
                );

                return { previous };
            },
            onError: (err, _vars, ctx) => {
                if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
                toast.error(err.message ?? "Kunne ikke slette booking.");
            },
            onSuccess: () => {
                toast.success("Booking slettet");
                setApenSlotTid(null);
            },
            onSettled: () => {
                invalidateAll();
            },
        }
    );

    return {
        slots: bookingerQuery.data ?? [],
        isLoading: bookingerQuery.isLoading,
        isFetching: bookingerQuery.isFetching,
        apenSlotTid,
        setApenSlotTid,

        onBook: (slot: BookingSlotRespons) =>
            bookMutation.mutate({
                baneId,
                dato,
                startTid: slot.startTid,
                sluttTid: slot.sluttTid,
            }),

        onCancel: (slot: BookingSlotRespons) =>
            cancelMutation.mutate({
                baneId,
                dato,
                startTid: slot.startTid,
                sluttTid: slot.sluttTid,
            }),

        onDelete: (slot: BookingSlotRespons) =>
            deleteMutation.mutate({
                baneId: slot.baneId ?? baneId,
                dato: slot.dato ?? dato,
                startTid: slot.startTid,
                sluttTid: slot.sluttTid,
            }),

        hentBookinger: bookingerQuery.refetch,
    };
}
