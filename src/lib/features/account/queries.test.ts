import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { MinBookingRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { accountQueryKeys } from "./query-keys";
import { cancelMyBookingMutationOptions } from "./queries";

const booking: MinBookingRespons = {
  bookingId: "booking-1",
  grenId: "tennis",
  grenNavn: "Tennis",
  baneId: "court-1",
  baneNavn: "Bane 1",
  dato: "2026-08-25",
  startTid: "10:00",
  sluttTid: "11:00",
  erPassert: false,
  kapabiliteter: ["booking:fjern"],
};

describe("account mutations", () => {
  it("fjerner optimistisk fra begge historikkvarianter og invaliderer eksakt Mine tider og slot", async () => {
    const request = vi.fn().mockResolvedValue({ melding: "Avbestilt" });
    const api = { request } as unknown as ApiClient;
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const currentKey = accountQueryKeys.myBookingsList("fjordvik", false);
    const historyKey = accountQueryKeys.myBookingsList("fjordvik", true);
    queryClient.setQueryData(currentKey, [booking]);
    queryClient.setQueryData(historyKey, [booking]);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const options = cancelMyBookingMutationOptions(api, queryClient, "fjordvik");
    const variables = { bookingId: "booking-1", courtId: "court-1", date: "2026-08-25" };

    const context = await options.onMutate(variables);
    expect(queryClient.getQueryData(currentKey)).toEqual([]);
    expect(queryClient.getQueryData(historyKey)).toEqual([]);
    await options.mutationFn(variables);
    await options.onSettled(undefined, null, variables);

    expect(request).toHaveBeenCalledWith("klubb/fjordvik/bookinger/booking-1", {
      method: "DELETE",
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: accountQueryKeys.myBookings("fjordvik") });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: accountQueryKeys.bookingSlots("fjordvik", "court-1", "2026-08-25"),
    });
    expect(context.previous).toHaveLength(2);
  });

  it("ruller alle Mine tider-varianter tilbake ved avvist avbestilling", async () => {
    const api = { request: vi.fn() } as unknown as ApiClient;
    const queryClient = new QueryClient();
    const currentKey = accountQueryKeys.myBookingsList("fjordvik", false);
    const historyKey = accountQueryKeys.myBookingsList("fjordvik", true);
    queryClient.setQueryData(currentKey, [booking]);
    queryClient.setQueryData(historyKey, [booking]);
    const options = cancelMyBookingMutationOptions(api, queryClient, "fjordvik");
    const variables = { bookingId: "booking-1", courtId: "court-1", date: "2026-08-25" };

    const context = await options.onMutate(variables);
    options.onError(new Error("Avvist"), variables, context);

    expect(queryClient.getQueryData(currentKey)).toEqual([booking]);
    expect(queryClient.getQueryData(historyKey)).toEqual([booking]);
  });
});
