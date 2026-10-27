import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import { ApiError, type ApiClient } from "#lib/platform/api/index.ts";
import { tenantQueryMeta } from "#lib/platform/query/index.ts";
import { Kapabiliteter } from "#lib/domain/index.ts";
import { createBootstrap, createSlot } from "./booking-test-data";
import { bookingQueryKeys } from "./query-keys";
import {
  cancelBookingMutationOptions,
  bookingCalendarQueryOptions,
  createBookingMutationOptions,
  createQuickArrangementMutationOptions,
  connectArrangementTimesMutationOptions,
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
      calendar: bootstrap.kalender,
    });
    expect(request).toHaveBeenCalledOnce();
  });

  it.each([404, 405])("bruker enkeltkall som fallback for status %s", async (status) => {
    const bootstrap = createBootstrap();
    const request = vi.fn(async (path: string) => {
      if (path.includes("booking-bootstrap")) throw new ApiError("Mangler", status);
      if (path.endsWith("/grener")) return bootstrap.grener;
      if (path.endsWith("/baner")) return bootstrap.baner;
      if (path.includes("/kalender?")) return bootstrap.kalender;
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

describe("booking calendar", () => {
  it("beholder forrige data og oppdaterer synlige tider hvert 60. sekund", () => {
    const initialData = { slots: [createSlot()], bookingstatus: null };
    const options = bookingCalendarQueryOptions(
      { request: vi.fn() as ApiClient["request"] },
      "fjordvik",
      "court-1",
      "2026-08-23",
      initialData
    );

    expect(options).toMatchObject({
      enabled: true,
      initialData,
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      staleTime: 5_000,
    });
    expect(options.placeholderData(initialData)).toEqual({
      slots: initialData.slots,
      bookingstatus: null,
    });
  });
});

describe("booking mutations", () => {
  it("oppdaterer optimistisk og invaliderer aktiv kalender og Mine tider ved suksess", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({ kapabiliteter: [Kapabiliteter.booking.book] });
    queryClient.setQueryData(queryKey, { slots: [slot], bookingstatus: null });
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
    expect(queryClient.getQueryData<{ slots: (typeof slot)[] }>(queryKey)?.slots[0]).toMatchObject({
      booketAv: "Du",
      erEier: true,
    });
    await options.onSuccess();
    expect(invalidate).toHaveBeenNthCalledWith(1, { queryKey });
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: bookingQueryKeys.mine("fjordvik"),
    });

    options.onError(new Error("Avvist"), request, context);
    expect(queryClient.getQueryData(queryKey)).toEqual({ slots: [slot], bookingstatus: null });
  });

  it("ruller oppretting tilbake uten refetch når serveren avviser bookingen", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({ kapabiliteter: [Kapabiliteter.booking.book] });
    queryClient.setQueryData(queryKey, { slots: [slot], bookingstatus: null });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const options = createBookingMutationOptions(
      { request: vi.fn() as ApiClient["request"] },
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
    options.onError(new Error("Avvist"), request, context);

    expect(queryClient.getQueryData(queryKey)).toEqual({ slots: [slot], bookingstatus: null });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("invaliderer etter vellykket avbestilling", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({
      bookingId: "booking-1",
      booketAv: "Du",
      erEier: true,
      kapabiliteter: [Kapabiliteter.booking.fjern],
    });
    queryClient.setQueryData(queryKey, { slots: [slot], bookingstatus: null });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const options = cancelBookingMutationOptions(
      { request: vi.fn().mockResolvedValue({ melding: "OK" }) as ApiClient["request"] },
      queryClient,
      "fjordvik",
      "court-1",
      "2026-08-23"
    );

    await options.onMutate({ bookingId: "booking-1" });
    expect(queryClient.getQueryData<{ slots: (typeof slot)[] }>(queryKey)?.slots[0]).toMatchObject({
      bookingId: null,
      booketAv: null,
    });
    await options.onSuccess({ melding: "Booking fjernet" }, { bookingId: "booking-1" });
    expect(invalidate).toHaveBeenNthCalledWith(1, { queryKey });
    expect(invalidate).toHaveBeenNthCalledWith(2, {
      queryKey: bookingQueryKeys.mine("fjordvik"),
    });
  });

  it("oppdaterer alle arrangementsflater i samme klubb etter kalenderavlysning", async () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined);
    const options = cancelBookingMutationOptions(
      { request: vi.fn() as ApiClient["request"] },
      client,
      "fjordvik",
      "court-1",
      "2026-08-23"
    );
    await options.onSuccess(
      { melding: "Slettet", slettetArrangementId: "event-1" },
      { bookingId: "booking-1", arrangementId: "event-1" }
    );
    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    for (const resource of ["arrangements", "arrangement-bookings", "booking-slots"] as const) {
      expect(
        predicate!({ meta: tenantQueryMeta("fjordvik", resource), queryKey: [resource] } as never)
      ).toBe(true);
      expect(
        predicate!({
          meta: tenantQueryMeta("annen-klubb", resource),
          queryKey: [resource],
        } as never)
      ).toBe(false);
    }
  });

  it("ruller avbestilling tilbake uten refetch når serveren avviser den", async () => {
    const queryClient = new QueryClient();
    const queryKey = bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23");
    const slot = createSlot({
      bookingId: "booking-1",
      booketAv: "Du",
      erEier: true,
      kapabiliteter: [Kapabiliteter.booking.fjern],
    });
    queryClient.setQueryData(queryKey, { slots: [slot], bookingstatus: null });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    const options = cancelBookingMutationOptions(
      { request: vi.fn() as ApiClient["request"] },
      queryClient,
      "fjordvik",
      "court-1",
      "2026-08-23"
    );

    const context = await options.onMutate({ bookingId: "booking-1" });
    options.onError(new Error("Avvist"), { bookingId: "booking-1" }, context);

    expect(queryClient.getQueryData(queryKey)).toEqual({ slots: [slot], bookingstatus: null });
    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("hurtigarrangement og cache", () => {
  it("kobler tider samlet og oppdaterer arrangementets bookinger bare i aktuell klubb", async () => {
    const queryClient = new QueryClient();
    const entries = [
      {
        key: ["arrangement-admin", "bookings", "fjordvik"],
        meta: tenantQueryMeta("fjordvik", "arrangement-bookings"),
      },
      { key: ["arrangement-admin", "fjordvik"], meta: tenantQueryMeta("fjordvik", "arrangements") },
      {
        key: bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23"),
        meta: tenantQueryMeta("fjordvik", "booking-slots"),
      },
      {
        key: ["arrangement-admin", "bookings", "annen-klubb"],
        meta: tenantQueryMeta("annen-klubb", "arrangement-bookings"),
      },
    ];
    for (const entry of entries) {
      await queryClient.fetchQuery({ ...entry, queryKey: entry.key, queryFn: async () => [] });
    }
    const request = vi.fn().mockResolvedValue({ opprettet: [], feilet: [] });
    const options = connectArrangementTimesMutationOptions(
      { request: request as ApiClient["request"] },
      queryClient,
      "fjordvik"
    );
    const body = {
      bookinger: [{ baneId: "court-1", dato: "2026-08-23", startTid: "10:00", sluttTid: "11:00" }],
    };
    await options.mutationFn({ arrangementId: "arrangement/1", request: body });
    await options.onSuccess();
    expect(request).toHaveBeenCalledWith(
      "klubb/fjordvik/arrangement/arrangement%2F1/bookinger/batch",
      { auth: "required", method: "POST", json: body }
    );
    expect(options.retry).toBe(false);
    expect(entries.map(({ key }) => queryClient.getQueryState(key)?.isInvalidated)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("oppdaterer arrangementer, aktive valg og kalender bare for aktuell klubb", async () => {
    const queryClient = new QueryClient();
    const entries = [
      {
        key: ["arrangement-admin", { slug: "fjordvik" }],
        meta: tenantQueryMeta("fjordvik", "arrangements"),
      },
      {
        key: bookingQueryKeys.activeArrangements("fjordvik", "tennis"),
        meta: tenantQueryMeta("fjordvik", "arrangements"),
      },
      {
        key: bookingQueryKeys.calendar("fjordvik", "court-1", "2026-08-23"),
        meta: tenantQueryMeta("fjordvik", "booking-slots"),
      },
      {
        key: bookingQueryKeys.calendar("annen-klubb", "court-2", "2026-08-23"),
        meta: tenantQueryMeta("annen-klubb", "booking-slots"),
      },
    ];
    for (const { key, meta } of entries) {
      await queryClient.fetchQuery({ queryKey: key, meta, queryFn: async () => [] });
    }
    const request = vi
      .fn()
      .mockResolvedValue({ arrangementId: "arrangement-1", antallOpprettet: 1, konflikter: [] });
    const options = createQuickArrangementMutationOptions(
      { request: request as ApiClient["request"] },
      queryClient,
      "fjordvik"
    );
    const body = {
      grenId: "tennis",
      tittel: "Trening",
      kategori: "Trening" as const,
      startDato: "2026-08-23",
      sluttDato: "2026-08-23",
      ukedager: ["Sunday" as const],
      baneGrupper: [{ baneIder: ["court-1"], tidspunkter: ["10:00"] }],
      eksplisitteSlots: [
        { baneId: "court-1", dato: "2026-08-23", startTid: "10:00", sluttTid: "11:00" },
      ],
    };
    await options.mutationFn(body);
    await options.onSuccess();
    expect(request).toHaveBeenCalledWith("klubb/fjordvik/arrangement", {
      auth: "required",
      method: "POST",
      json: body,
    });
    expect(options.retry).toBe(false);
    expect(entries.map(({ key }) => queryClient.getQueryState(key)?.isInvalidated)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });
});
