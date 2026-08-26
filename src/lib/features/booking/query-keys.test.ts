import { describe, expect, it } from "vitest";
import { bookingQueryKeys } from "./query-keys";

describe("booking query keys", () => {
  it("isolerer bootstrap, slots, arrangementer og Mine tider per tenant", () => {
    expect(bookingQueryKeys.bootstrap("fjordvik", "2026-08-23", "anonymous")).toEqual([
      "booking",
      { slug: "fjordvik" },
      "bootstrap",
      { date: "2026-08-23", userIdentity: "anonymous" },
    ]);
    expect(bookingQueryKeys.slots("fjordvik", "court-1", "2026-08-23")).toEqual([
      "booking",
      { slug: "fjordvik" },
      "slots",
      { courtId: "court-1", date: "2026-08-23" },
    ]);
    expect(bookingQueryKeys.mine("fjordvik")).toEqual(["booking", { slug: "fjordvik" }, "mine"]);
    expect(bookingQueryKeys.activeArrangements("fjordvik", "activity-1")).toEqual([
      "booking",
      { slug: "fjordvik" },
      "active-arrangements",
      { activityId: "activity-1" },
    ]);
  });
});
