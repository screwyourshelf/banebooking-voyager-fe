import { useState } from "react";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { KalenderSlotRespons } from "@/types";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useSlug } from "@/hooks/useSlug";
import { Kapabiliteter } from "@/utils/kapabiliteter";

type SlotVars = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  arrangementId?: string;
};
type CancelVars = { bookingId: string };
type OptimisticContext = { previous?: KalenderSlotRespons[] };

export function useBooking(dato: string, baneId: string) {
  const slug = useSlug();
  const queryClient = useQueryClient();
  const [apenSlotTid, setApenSlotTid] = useState<string | null>(null);

  const queryKey = ["bookinger", slug, baneId, dato] as const;

  const enabled = Boolean(baneId) && Boolean(dato);

  // GET slots
  const bookingerQuery = useApiQuery<KalenderSlotRespons[]>(
    queryKey,
    `/klubb/${slug}/kalender?baneId=${baneId}&dato=${dato}`,
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

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: ["mineBookinger", slug] });
  };

  const erSammeSlot = (s: KalenderSlotRespons, v: { startTid: string; sluttTid: string }) =>
    s.slotStartTid === v.startTid && s.slotSluttTid === v.sluttTid;

  // POST booking (optimistic)
  const bookMutation = useApiMutation<SlotVars, void, OptimisticContext>(
    "post",
    `/klubb/${slug}/bookinger`,
    {
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);

        queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (old = []) =>
          old.map((s) =>
            erSammeSlot(s, vars)
              ? {
                  ...s,
                  bookingId: null,
                  booketAv: "Du",
                  erEier: true,
                  bookingStartTid: s.slotStartTid,
                  bookingSluttTid: s.slotSluttTid,
                  kapabiliteter: [Kapabiliteter.booking.avbestill],
                }
              : s
          )
        );

        return { previous };
      },
      onError: (err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
        toast.error(err.message);
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
  const cancelMutation = useApiMutation<CancelVars, void, OptimisticContext>(
    "delete",
    (vars) => `/klubb/${slug}/bookinger/${vars.bookingId}`,
    {
      getBody: () => undefined,
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);

        queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (old = []) =>
          old.map((s) =>
            s.bookingId === vars.bookingId
              ? {
                  ...s,
                  bookingId: null,
                  booketAv: null,
                  erEier: false,
                  bookingStartTid: null,
                  bookingSluttTid: null,
                  kapabiliteter: [Kapabiliteter.booking.book],
                }
              : s
          )
        );

        return { previous };
      },
      onError: (err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
        toast.error(err.message);
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
  const deleteMutation = useApiMutation<CancelVars, void, OptimisticContext>(
    "delete",
    (vars) => `/klubb/${slug}/bookinger/${vars.bookingId}/admin`,
    {
      getBody: () => undefined,
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey });

        const previous = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);

        queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (old = []) =>
          old.map((s) =>
            s.bookingId === vars.bookingId
              ? {
                  ...s,
                  bookingId: null,
                  booketAv: null,
                  erEier: false,
                  bookingStartTid: null,
                  bookingSluttTid: null,
                  kapabiliteter: [Kapabiliteter.booking.book],
                }
              : s
          )
        );

        return { previous };
      },
      onError: (err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
        toast.error(err.message);
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
    error: bookingerQuery.error,
    apenSlotTid,
    setApenSlotTid,

    onBook: (slot: KalenderSlotRespons, arrangementId?: string) =>
      bookMutation.mutate({
        baneId,
        dato,
        startTid: slot.slotStartTid,
        sluttTid: slot.slotSluttTid,
        arrangementId,
      }),

    onCancel: (slot: KalenderSlotRespons) => {
      if (!slot.bookingId) return;
      cancelMutation.mutate({ bookingId: slot.bookingId });
    },

    onDelete: (slot: KalenderSlotRespons) => {
      if (!slot.bookingId) return;
      deleteMutation.mutate({ bookingId: slot.bookingId });
    },

    hentBookinger: bookingerQuery.refetch,
  };
}
