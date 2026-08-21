import { describe, expect, it } from "vitest";

import type { LokalBooking } from "../../types";
import {
  grupperBookingerEtterDato,
  kanBookingOpprettes,
  sorterBookinger,
} from "./bookingListeUtils";

function lagBooking(overrides: Partial<LokalBooking> = {}): LokalBooking {
  return {
    id: "booking",
    dato: "2026-08-15",
    startTid: "08:00",
    sluttTid: "09:00",
    baneId: "bane-a",
    baneNavn: "Bane A",
    status: "ledig",
    kilde: "generert",
    ...overrides,
  };
}

describe("bookingListeUtils", () => {
  it("sorterer kronologisk og grupperer etter dato", () => {
    const sorterte = sorterBookinger([
      lagBooking({ id: "sen", dato: "2026-08-16", startTid: "10:00" }),
      lagBooking({ id: "tidlig", startTid: "07:00" }),
      lagBooking({ id: "midt", startTid: "09:00" }),
    ]);

    const grupper = grupperBookingerEtterDato(sorterte);

    expect(grupper.map((gruppe) => gruppe.dato)).toEqual(["2026-08-15", "2026-08-16"]);
    expect(grupper[0].bookinger.map((booking) => booking.id)).toEqual(["tidlig", "midt"]);
    expect(grupper[1].bookinger.map((booking) => booking.id)).toEqual(["sen"]);
  });

  it("utelater konflikter og slettede tider fra opprettelse", () => {
    expect(kanBookingOpprettes(lagBooking())).toBe(true);
    expect(kanBookingOpprettes(lagBooking({ status: "konflikt" }))).toBe(false);
    expect(kanBookingOpprettes(lagBooking({ erSlettet: true }))).toBe(false);
  });
});
