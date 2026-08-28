import { describe, expect, it } from "vitest";
import { accountQueryKeys } from "./query-keys";

describe("account query keys", () => {
  it("legger Mine tider og kalenderen under bookingens etablerte tenantnøkkel", () => {
    expect(accountQueryKeys.myBookingsList("fjordvik", true)).toEqual([
      "booking",
      { slug: "fjordvik" },
      "mine",
      { includeHistorical: true },
    ]);
    expect(accountQueryKeys.bookingCalendar("fjordvik", "court-1", "2026-08-25")).toEqual([
      "booking",
      { slug: "fjordvik" },
      "calendar",
      { courtId: "court-1", date: "2026-08-25" },
    ]);
  });
});
