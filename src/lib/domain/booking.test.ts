import { describe, expect, it } from "vitest";
import type { KalenderSlotRespons } from "$lib/contracts";
import { grupperSlots, utledSlotStatus } from "./booking";

function slot(overrides: Partial<KalenderSlotRespons> = {}): KalenderSlotRespons {
  return {
    bookingId: null,
    baneId: "bane-1",
    baneNavn: "Bane 1",
    dato: "2026-08-22",
    slotStartTid: "10:00",
    slotSluttTid: "11:00",
    bookingStartTid: null,
    bookingSluttTid: null,
    booketAv: null,
    erPassert: false,
    kapabiliteter: [],
    ...overrides,
  };
}

describe("bookingdomene", () => {
  it("utleder status fra den eksisterende transportkontrakten", () => {
    expect(utledSlotStatus(slot(), false)).toBe("ledig");
    expect(utledSlotStatus(slot({ erPassert: true }), true)).toBe("passert");
    expect(utledSlotStatus(slot({ arrangementTittel: "Klubbmesterskap" }), false)).toBe(
      "arrangement"
    );
    expect(utledSlotStatus(slot({ bookingId: "booking-1", erEier: true }), true)).toBe(
      "din_booking"
    );
  });

  it("grupperer sammenhengende slots med samme booking-ID", () => {
    expect(
      grupperSlots([
        slot({ bookingId: "booking-1", slotStartTid: "10:00" }),
        slot({ bookingId: "booking-1", slotStartTid: "11:00" }),
        slot({ bookingId: null, slotStartTid: "12:00" }),
      ]).map((item) => item.slotStartTid)
    ).toEqual(["10:00", "12:00"]);
  });
});
