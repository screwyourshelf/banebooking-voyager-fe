import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError, type ApiClient } from "$lib/platform/api";
import { Kapabiliteter } from "$lib/domain";
import { createBootstrap, createSlot } from "./booking-test-data";
import { bookingQueryKeys } from "./query-keys";
import {
  cancelBookingMutationOptions,
  bookingSlotsQueryOptions,
  createBookingMutationOptions,
  loadInitialBookingData,
  shouldUseBookingBootstrapFallback,
} from "./queries";

describe("booking bootstrap", () => {
  it("bruker det samlede endepunktet og beholder serverens startutvalg", async () => {
    const bootstrap = createBootstrap();
    const request = vi.fn().mockResolvedValue(bootstrap);
    const result = await loadInitialBookingData(
      { request: request as ApiClient["request"] },
      "fjordvik",
      "2026-08-23"
    );

    expect(result).toMatchObject({
      source: "bootstrap",
      initialActivityId: "activity-1",
      initialCourtId: "court-1",
      slots: bootstrap.kalenderSlots,
    });
    expect(request).toHaveBeenCalledOnce();
  });

  it.each([404, 405])("bruker enkeltkall som fallback for status %s", async (status) => {
    const bootstrap = createBootstrap();
    const request = vi.fn(async (path: string) => {
      if (path.includes("booking-bootstrap")) throw new ApiError("Mangler", status);
      if (path.endsWith("/grener")) return bootstrap.grener;
      if (path.endsWith("/baner")) return bootstrap.baner;
      if (path.includes("/kalender?")) return bootstrap.kalenderSlots;
      throw new Error(`Uventet kall: ${path}`);
    });

    const result = await loadInitialBookingData(
      { request: request as ApiClient["request"] },
      "fjordvik",
      "2026-08-23"
    );

    expect(result.source).toBe("fallback");
    expect(request).toHaveBeenCalledTimes(4);
    expect(request.mock.calls.map(([path]) => path)).toEqual([
      "klubb/fjordvik/booking-bootstrap?dato=2026-08-23",
      "klubb/fjordvik/grener",
      "klubb/fjordvik/baner",
      "klubb/fjordvik/kalender?baneId=court-1&dato=2026-08-23",
    ]);
  });

  it.each([400, 401, 500, undefined])("skjuler ikke bootstrapfeil med status %s", (status) => {
    expect(shouldUseBookingBootstrapFallback(new ApiError("Feil", { status }))).toBe(false);
  });
});

describe("booking slots", () => {
  it("beholder forrige data og oppdaterer synlige tider hvert 30. sekund", () => {
    const initialData = [createSlot()];
    const options = bookingSlotsQueryOptions(
      { request: vi.fn() as ApiClient["request"] },
      "fjordvik",
      "court-1",
      "2026-08-23",
      initialData
    );

    expect(options).toMatchObject({
      enabled: true,
      initialData,
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      staleTime: 5_000,
    });
    expect(options.placeholderData(initialData)).toBe(initialData);
  });
});

describe("booking mutations", () => {
  it("oppdaterer optimistisk og invaliderer aktiv kalender og Mine tider", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.slots("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({ kapabiliteter: [Kapabiliteter.booking.book] });
    queryClient.setQueryData(queryKey, [slot]);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const options = createBookingMutationOptions(
      { request: vi.fn().mockResolvedValue({ melding: "OK" }) as ApiClient["request"] },
      queryClient,
      "fjordvik",
      "court-1",
      "2026-08-23"
    );
    const request = {
      baneId: "court-1",
      dato: "2026-08-23",
      startTid: "10:00",
      sluttTid: "11:00",
    };

    const context = await options.onMutate(request);
    expect(queryClient.getQueryData<(typeof slot)[]>(queryKey)?.[0]).toMatchObject({
      booketAv: "Du",
      erEier: true,
    });
    await options.onSettled();
    expect(invalidate).toHaveBeenNthCalledWith(1, { queryKey });
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: bookingQueryKeys.mine("fjordvik"),
    });

    options.onError(new Error("Avvist"), request, context);
    expect(queryClient.getQueryData(queryKey)).toEqual([slot]);
  });

  it("ruller avbestilling tilbake til eksakt forrige slotliste", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.slots("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({
      bookingId: "booking-1",
      booketAv: "Du",
      erEier: true,
      kapabiliteter: [Kapabiliteter.booking.fjern],
    });
    queryClient.setQueryData(queryKey, [slot]);
    const options = cancelBookingMutationOptions(
      { request: vi.fn().mockResolvedValue({ melding: "OK" }) as ApiClient["request"] },
      queryClient,
      "fjordvik",
      "court-1",
      "2026-08-23"
    );

    const context = await options.onMutate({ bookingId: "booking-1" });
    expect(queryClient.getQueryData<(typeof slot)[]>(queryKey)?.[0]).toMatchObject({
      bookingId: null,
      booketAv: null,
    });
    options.onError(new Error("Avvist"), { bookingId: "booking-1" }, context);
    expect(queryClient.getQueryData(queryKey)).toEqual([slot]);
  });
});
