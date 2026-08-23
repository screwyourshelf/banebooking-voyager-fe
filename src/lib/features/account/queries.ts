import type { MinBookingRespons, OppdaterProfilForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import type { QueryClient } from "@tanstack/svelte-query";
import {
  cancelMyBooking,
  deleteMyAccount,
  getMyAccountData,
  getMyBookings,
  updateMyProfile,
} from "./api";
import { accountQueryKeys } from "./query-keys";

export type CancelMyBookingVariables = {
  bookingId: string;
  courtId: string;
  date: string;
};

type BookingQueriesSnapshot = Array<readonly [readonly unknown[], MinBookingRespons[] | undefined]>;

export function myBookingsQueryOptions(api: ApiClient, slug: string, includeHistorical: boolean) {
  return {
    queryKey: accountQueryKeys.myBookingsList(slug, includeHistorical),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getMyBookings(api, slug, includeHistorical, signal),
    staleTime: 60_000,
  };
}

export function cancelMyBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  const mineKey = accountQueryKeys.myBookings(slug);
  return {
    mutationFn: ({ bookingId }: CancelMyBookingVariables) => cancelMyBooking(api, slug, bookingId),
    onMutate: async ({ bookingId }: CancelMyBookingVariables) => {
      await queryClient.cancelQueries({ queryKey: mineKey });
      const previous = queryClient.getQueriesData<MinBookingRespons[]>({ queryKey: mineKey });
      queryClient.setQueriesData<MinBookingRespons[]>({ queryKey: mineKey }, (bookings = []) =>
        bookings.filter((booking) => booking.bookingId !== bookingId)
      );
      return { previous };
    },
    onError: (
      _error: Error,
      _variables: CancelMyBookingVariables,
      context: { previous: BookingQueriesSnapshot } | undefined
    ) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: (_data: unknown, _error: Error | null, variables: CancelMyBookingVariables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: mineKey }),
        queryClient.invalidateQueries({
          queryKey: accountQueryKeys.bookingSlots(slug, variables.courtId, variables.date),
        }),
      ]),
    retry: false,
  };
}

export function updateMyProfileMutationOptions(
  api: ApiClient,
  slug: string,
  onUpdated: () => Promise<unknown>
) {
  return {
    mutationFn: (request: OppdaterProfilForespørsel) => updateMyProfile(api, slug, request),
    onSuccess: onUpdated,
    retry: false,
  };
}

export function deleteMyAccountMutationOptions(api: ApiClient, slug: string) {
  return {
    mutationFn: () => deleteMyAccount(api, slug),
    retry: false,
  };
}

export function myAccountDataMutationOptions(api: ApiClient, slug: string) {
  return {
    mutationFn: () => getMyAccountData(api, slug),
    retry: false,
  };
}
