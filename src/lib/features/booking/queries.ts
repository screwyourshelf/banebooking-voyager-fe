import { keepPreviousData, type QueryClient } from "@tanstack/svelte-query";
import type {
  BaneRespons,
  GrenRespons,
  KalenderSlotRespons,
  OpprettBookingForespørsel,
} from "$lib/contracts";
import { ApiError, type ApiClient } from "$lib/platform/api";
import {
  cancelBooking,
  createBooking,
  getActiveArrangements,
  getBookingActivities,
  getBookingBootstrap,
  getBookingCourts,
  getBookingSlots,
} from "./api";
import { markSlotAsAvailable, markSlotAsOwnBooking, resolveBookingSelection } from "./model";
import { bookingQueryKeys } from "./query-keys";

export type BookingInitialData = {
  activities: GrenRespons[];
  courts: BaneRespons[];
  date: string;
  initialCourtId: string;
  initialActivityId: string;
  slots: KalenderSlotRespons[];
  source: "bootstrap" | "fallback";
};

export type CancelBookingVariables = {
  bookingId: string;
};

type OptimisticBookingContext = {
  previousSlots: KalenderSlotRespons[] | undefined;
};

export function bookingBootstrapQueryOptions(
  api: ApiClient,
  slug: string,
  date: string,
  userIdentity: string
) {
  return {
    queryKey: bookingQueryKeys.bootstrap(slug, date, userIdentity),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      loadInitialBookingData(api, slug, date, signal),
    retry: false,
    staleTime: 60_000,
  };
}

export function bookingSlotsQueryOptions(
  api: ApiClient,
  slug: string,
  courtId: string,
  date: string,
  initialData?: KalenderSlotRespons[]
) {
  return {
    queryKey: bookingQueryKeys.slots(slug, courtId, date),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getBookingSlots(api, slug, courtId, date, signal),
    enabled: Boolean(courtId && date),
    initialData,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  };
}

export function activeArrangementsQueryOptions(
  api: ApiClient,
  slug: string,
  activityId: string,
  enabled: boolean
) {
  return {
    queryKey: bookingQueryKeys.activeArrangements(slug, activityId),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getActiveArrangements(api, slug, activityId, signal),
    enabled: enabled && Boolean(activityId),
    staleTime: 30_000,
  };
}

export function createBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  courtId: string,
  date: string
) {
  const queryKey = bookingQueryKeys.slots(slug, courtId, date);

  return {
    mutationFn: (request: OpprettBookingForespørsel) => createBooking(api, slug, request),
    onMutate: async (request: OpprettBookingForespørsel): Promise<OptimisticBookingContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previousSlots = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);
      queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (slots = []) =>
        markSlotAsOwnBooking(slots, request)
      );
      return { previousSlots };
    },
    onError: (
      _error: Error,
      _request: OpprettBookingForespørsel,
      context: OptimisticBookingContext | undefined
    ) => restorePreviousSlots(queryClient, queryKey, context),
    onSettled: () => invalidateBookingData(queryClient, slug, courtId, date),
    retry: false,
  };
}

export function cancelBookingMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string,
  courtId: string,
  date: string
) {
  const queryKey = bookingQueryKeys.slots(slug, courtId, date);

  return {
    mutationFn: ({ bookingId }: CancelBookingVariables) => cancelBooking(api, slug, bookingId),
    onMutate: async ({ bookingId }: CancelBookingVariables): Promise<OptimisticBookingContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previousSlots = queryClient.getQueryData<KalenderSlotRespons[]>(queryKey);
      queryClient.setQueryData<KalenderSlotRespons[]>(queryKey, (slots = []) =>
        markSlotAsAvailable(slots, bookingId)
      );
      return { previousSlots };
    },
    onError: (
      _error: Error,
      _variables: CancelBookingVariables,
      context: OptimisticBookingContext | undefined
    ) => restorePreviousSlots(queryClient, queryKey, context),
    onSettled: () => invalidateBookingData(queryClient, slug, courtId, date),
    retry: false,
  };
}

export async function loadInitialBookingData(
  api: ApiClient,
  slug: string,
  date: string,
  signal?: AbortSignal
): Promise<BookingInitialData> {
  try {
    const bootstrap = await getBookingBootstrap(api, slug, date, signal);
    const selection = resolveBookingSelection(
      bootstrap.grener,
      bootstrap.baner,
      bootstrap.valgtGrenId,
      bootstrap.valgtBaneId
    );
    return {
      activities: bootstrap.grener,
      courts: bootstrap.baner,
      date: bootstrap.dato,
      initialActivityId: selection.activityId,
      initialCourtId: selection.courtId,
      slots: bootstrap.kalenderSlots,
      source: "bootstrap",
    };
  } catch (error) {
    if (signal?.aborted || !shouldUseBookingBootstrapFallback(error)) throw error;
  }

  const [activities, courts] = await Promise.all([
    getBookingActivities(api, slug, signal),
    getBookingCourts(api, slug, signal),
  ]);
  const selection = resolveBookingSelection(activities, courts, null, null);
  const slots = selection.courtId
    ? await getBookingSlots(api, slug, selection.courtId, date, signal)
    : [];

  return {
    activities,
    courts,
    date,
    initialActivityId: selection.activityId,
    initialCourtId: selection.courtId,
    slots,
    source: "fallback",
  };
}

export function shouldUseBookingBootstrapFallback(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.status === 405);
}

function invalidateBookingData(
  queryClient: QueryClient,
  slug: string,
  courtId: string,
  date: string
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.slots(slug, courtId, date) }),
    queryClient.invalidateQueries({ queryKey: bookingQueryKeys.mine(slug) }),
  ]);
}

function restorePreviousSlots(
  queryClient: QueryClient,
  queryKey: ReturnType<typeof bookingQueryKeys.slots>,
  context: OptimisticBookingContext | undefined
) {
  if (context?.previousSlots) queryClient.setQueryData(queryKey, context.previousSlots);
}
