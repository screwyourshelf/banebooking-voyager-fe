import { describe, expect, it } from "vitest";
import type { BrukerBookingRespons } from "$lib/contracts";
import {
  filterBookingsByActivity,
  getBookingActivityOptions,
  groupBookingsByDate,
  sortBookingsByRelevance,
} from "./booking-list";

function booking(overrides: Partial<BrukerBookingRespons> = {}): BrukerBookingRespons {
  return {
    bookingId: "booking-1",
    grenId: "tennis",
    grenNavn: "Tennis",
    baneId: "court-1",
    baneNavn: "Bane 1",
    dato: "2026-08-25",
    startTid: "10:00",
    sluttTid: "11:00",
    erPassert: false,
    kapabiliteter: [],
    ...overrides,
  };
}

describe("booking list", () => {
  it("sorterer kommende først, historikk nyest først og grupperer etter dato", () => {
    const bookings = [
      booking({ bookingId: "past-old", dato: "2026-08-20", erPassert: true }),
      booking({ bookingId: "future-late", dato: "2026-08-27" }),
      booking({ bookingId: "past-new", dato: "2026-08-22", erPassert: true }),
      booking({ bookingId: "future-early", dato: "2026-08-25" }),
    ];
    const sorted = sortBookingsByRelevance(bookings);
    expect(sorted.map(({ bookingId }) => bookingId)).toEqual([
      "future-early",
      "future-late",
      "past-new",
      "past-old",
    ]);
    expect(groupBookingsByDate(sorted).map(({ date }) => date)).toEqual([
      "2026-08-25",
      "2026-08-27",
      "2026-08-22",
      "2026-08-20",
    ]);
  });

  it("lager alfabetiske grenvalg og filtrerer uten å endre kildelisten", () => {
    const bookings = [
      booking({ bookingId: "padel", grenId: "padel", grenNavn: "Padel" }),
      booking({ bookingId: "tennis" }),
      booking({ bookingId: "tennis-2" }),
    ];
    expect(getBookingActivityOptions(bookings)).toEqual([
      { value: "padel", label: "Padel" },
      { value: "tennis", label: "Tennis" },
    ]);
    expect(
      filterBookingsByActivity(bookings, ["tennis"]).map(({ bookingId }) => bookingId)
    ).toEqual(["tennis", "tennis-2"]);
    expect(bookings).toHaveLength(3);
  });
});
