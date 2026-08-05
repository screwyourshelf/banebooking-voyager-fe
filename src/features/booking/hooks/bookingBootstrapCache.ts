import type { QueryClient } from "@tanstack/react-query";
import type { BookingBootstrapRespons } from "@/types";
import { bookingQueryKeys } from "./bookingQueryKeys";

export function hydrerBookingBootstrapCache(
  queryClient: QueryClient,
  slug: string,
  bootstrap: BookingBootstrapRespons
) {
  queryClient.setQueryData(["klubb", slug], bootstrap.klubb);
  queryClient.setQueryData(["grener", slug, false], bootstrap.grener);
  queryClient.setQueryData(["baner", slug, false], bootstrap.baner);

  if (bootstrap.bruker) {
    queryClient.setQueryData(["bruker", slug], bootstrap.bruker);
  }

  if (bootstrap.valgtBaneId) {
    queryClient.setQueryData(
      bookingQueryKeys.slots(slug, bootstrap.valgtBaneId, bootstrap.dato),
      bootstrap.kalenderSlots
    );
  }
}
