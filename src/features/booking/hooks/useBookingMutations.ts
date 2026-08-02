import { useMemo } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";
import type { KalenderSlotRespons } from "@/types";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { bookingQueryKeys } from "./bookingQueryKeys";

type BookSlotVariables = {
  baneId: string;
  dato: string;
  startTid: string;
  sluttTid: string;
  arrangementId?: string;
};

type CancelBookingVariables = {
  bookingId: string;
  startTid: string;
  sluttTid: string;
};

type OptimisticContext = {
  previous?: KalenderSlotRespons[];
};

type Params = {
  slug: string;
  dato: string;
  baneId: string;
};

export function useBookingMutations({ slug, dato, baneId }: Params) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => bookingQueryKeys.slots(slug, baneId, dato), [slug, baneId, dato]);

  function invalidateBookingData() {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: bookingQueryKeys.mine(slug) });
  }

  const bookMutation = useApiMutation<BookSlotVariables, void, OptimisticContext>(
    "post",
    `/klubb/${slug}/bookinger`,
    {
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);

        queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (slots = []) =>
          slots.map((slot) => (isSameSlot(slot, variables) ? markSlotAsOwnBooking(slot) : slot))
        );

        return { previous };
      },
      onError: (_error, _variables, context) => {
        restorePreviousSlots(queryClient, queryKey, context);
      },
      onSettled: invalidateBookingData,
    }
  );

  const cancelMutation = useApiMutation<CancelBookingVariables, void, OptimisticContext>(
    "delete",
    (variables) => `/klubb/${slug}/bookinger/${variables.bookingId}`,
    {
      getBody: () => undefined,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);

        queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (slots = []) =>
          slots.map((slot) =>
            slot.bookingId === variables.bookingId ? markSlotAsAvailable(slot) : slot
          )
        );

        return { previous };
      },
      onError: (_error, _variables, context) => {
        restorePreviousSlots(queryClient, queryKey, context);
      },
      onSettled: invalidateBookingData,
    }
  );

  function bookSlot(slot: KalenderSlotRespons, arrangementId?: string) {
    cancelMutation.reset();
    bookMutation.mutate({
      baneId,
      dato,
      startTid: slot.slotStartTid,
      sluttTid: slot.slotSluttTid,
      arrangementId,
    });
  }

  function cancelBooking(slot: KalenderSlotRespons) {
    if (!slot.bookingId) return;

    bookMutation.reset();
    cancelMutation.mutate({
      bookingId: slot.bookingId,
      startTid: slot.bookingStartTid ?? slot.slotStartTid,
      sluttTid: slot.bookingSluttTid ?? slot.slotSluttTid,
    });
  }

  return {
    bookSlot,
    cancelBooking,
    bookFeil: bookMutation.error,
    fjernFeil: cancelMutation.error,
  };
}

function isSameSlot(
  slot: KalenderSlotRespons,
  variables: Pick<BookSlotVariables, "startTid" | "sluttTid">
) {
  return slot.slotStartTid === variables.startTid && slot.slotSluttTid === variables.sluttTid;
}

function markSlotAsOwnBooking(slot: KalenderSlotRespons): KalenderSlotRespons {
  return {
    ...slot,
    bookingId: null,
    booketAv: "Du",
    erEier: true,
    bookingStartTid: slot.slotStartTid,
    bookingSluttTid: slot.slotSluttTid,
    kapabiliteter: [Kapabiliteter.booking.fjern],
  };
}

function markSlotAsAvailable(slot: KalenderSlotRespons): KalenderSlotRespons {
  return {
    ...slot,
    bookingId: null,
    booketAv: null,
    erEier: false,
    bookingStartTid: null,
    bookingSluttTid: null,
    kapabiliteter: [Kapabiliteter.booking.book],
  };
}

function restorePreviousSlots(
  queryClient: QueryClient,
  queryKey: ReturnType<typeof bookingQueryKeys.slots>,
  context?: OptimisticContext
) {
  if (context?.previous) {
    queryClient.setQueryData(queryKey, context.previous);
  }
}
