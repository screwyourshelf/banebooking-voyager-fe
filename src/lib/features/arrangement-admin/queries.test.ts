import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { ArrangementBookingRespons, ArrangementRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import {
  addArrangementBookingMutationOptions,
  addArrangementBookingsBatchMutationOptions,
  deleteArrangementBookingMutationOptions,
  updateArrangementBookingMutationOptions,
  updateArrangementMetadataMutationOptions,
} from "./queries";
import { arrangementAdminQueryKeys } from "./query-keys";

const arrangement = {
  beskrivelse: "Før",
  id: "arrangement-1",
  kategori: "Annet",
  nettsideBeskrivelse: "Før",
  nettsideTittel: "Før",
  publisertPåNettsiden: false,
} as ArrangementRespons;

const booking = {
  baneId: "court-1",
  baneNavn: "Bane 1",
  bookingId: "booking-1",
  dato: "2026-08-26",
  sluttTid: "11:00",
  startTid: "10:00",
} satisfies ArrangementBookingRespons;

function createClient() {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  return { invalidate, queryClient };
}

function fakeApi() {
  return { request: vi.fn() } as unknown as ApiClient;
}

describe("arrangement admin cache updates", () => {
  it("oppdaterer metadata lokalt og invaliderer bare andre arrangementsvisninger", async () => {
    const { invalidate, queryClient } = createClient();
    const key = arrangementAdminQueryKeys.arrangements("fjordvik");
    queryClient.setQueryData(key, [arrangement]);
    const options = updateArrangementMetadataMutationOptions(
      fakeApi(),
      queryClient,
      "fjordvik",
      arrangement.id
    );

    await options.onSuccess({
      arrangementId: arrangement.id,
      beskrivelse: "Etter",
      kategori: "Trening",
      nettsideBeskrivelse: "Ny nettsidetekst",
      nettsideTittel: "Ny tittel",
      publisertPåNettsiden: true,
    });

    expect(queryClient.getQueryData<ArrangementRespons[]>(key)?.[0]).toMatchObject({
      beskrivelse: "Etter",
      kategori: "Trening",
      nettsideBeskrivelse: "Ny nettsidetekst",
      nettsideTittel: "Ny tittel",
      publisertPåNettsiden: true,
    });
    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "arrangements"),
        queryKey: key,
      } as never)
    ).toBe(false);
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "arrangements"),
        queryKey: ["arrangements", { slug: "fjordvik" }],
      } as never)
    ).toBe(true);
  });

  it("legger enkelt- og batchsvar direkte i bookingcachen", async () => {
    const { invalidate, queryClient } = createClient();
    const key = arrangementAdminQueryKeys.bookings("fjordvik", arrangement.id);
    queryClient.setQueryData<ArrangementBookingRespons[]>(key, []);
    const add = addArrangementBookingMutationOptions(
      fakeApi(),
      queryClient,
      "fjordvik",
      arrangement.id
    );
    const batch = addArrangementBookingsBatchMutationOptions(
      fakeApi(),
      queryClient,
      "fjordvik",
      arrangement.id
    );
    const secondBooking = { ...booking, bookingId: "booking-2", startTid: "11:00" };

    await add.onSuccess(booking);
    await batch.onSuccess({ feilet: [], opprettet: [booking, secondBooking] });

    expect(queryClient.getQueryData<ArrangementBookingRespons[]>(key)).toEqual([
      booking,
      secondBooking,
    ]);
    expect(invalidate).toHaveBeenCalledTimes(2);
    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "arrangements"),
        queryKey: ["arrangements", { slug: "fjordvik" }],
      } as never)
    ).toBe(true);
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "user"),
        queryKey: ["session", { slug: "fjordvik" }],
      } as never)
    ).toBe(false);
  });

  it("erstatter en oppdatert booking direkte og invaliderer avledede ressurser én gang", async () => {
    const { invalidate, queryClient } = createClient();
    const key = arrangementAdminQueryKeys.bookings("fjordvik", arrangement.id);
    queryClient.setQueryData(key, [booking]);
    const options = updateArrangementBookingMutationOptions(
      fakeApi(),
      queryClient,
      "fjordvik",
      arrangement.id
    );
    const updated = {
      ...booking,
      baneId: "court-2",
      baneNavn: "Bane 2",
      startTid: "12:00",
      sluttTid: "13:00",
    };

    await options.onSuccess(updated);

    expect(queryClient.getQueryData(key)).toEqual([updated]);
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(options).not.toHaveProperty("onSettled");
  });

  it("invaliderer avledede ressurser etter en vanlig sletting", async () => {
    const { invalidate, queryClient } = createClient();
    const key = arrangementAdminQueryKeys.bookings("fjordvik", arrangement.id);
    queryClient.setQueryData(key, [booking]);
    const options = deleteArrangementBookingMutationOptions(
      fakeApi(),
      queryClient,
      "fjordvik",
      arrangement.id
    );

    await options.onSuccess(undefined, booking.bookingId);

    expect(queryClient.getQueryData(key)).toEqual([]);
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(options).not.toHaveProperty("onSettled");
  });
});
