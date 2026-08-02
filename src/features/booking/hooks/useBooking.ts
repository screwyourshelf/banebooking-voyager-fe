import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useSlug } from "@/hooks/useSlug";
import type { KalenderSlotRespons } from "@/types";
import { bookingQueryKeys } from "./bookingQueryKeys";
import { useBookingMutations } from "./useBookingMutations";

export function useBooking(dato: string, baneId: string) {
  const slug = useSlug();
  const queryKey = bookingQueryKeys.slots(slug, baneId, dato);
  const enabled = Boolean(baneId && dato);

  const bookingerQuery = useApiQuery<KalenderSlotRespons[]>(
    queryKey,
    `/klubb/${slug}/kalender?baneId=${baneId}&dato=${dato}`,
    {
      requireAuth: false,
      enabled,
      staleTime: 5_000,
      refetchInterval: 30_000,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
      placeholderData: keepPreviousData,
    }
  );

  const mutations = useBookingMutations({ slug, dato, baneId });

  return {
    slots: bookingerQuery.data ?? [],
    isLoading: bookingerQuery.isLoading,
    isFetching: bookingerQuery.isFetching,
    error: bookingerQuery.error,
    refetch: bookingerQuery.refetch,
    ...mutations,
  };
}
