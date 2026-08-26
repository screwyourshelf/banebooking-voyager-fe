import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  cancelBooking,
  createBooking,
  getActiveArrangements,
  getBookingActivities,
  getBookingBootstrap,
  getBookingCourts,
  getBookingSlots,
} from "./api";

describe("booking endpoints", () => {
  it("bruker de offentlige bootstrap-, oppsett- og kalenderkontraktene", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request: request as ApiClient["request"] };

    await getBookingBootstrap(api, "fjord vik", "2026-08-23");
    await getBookingActivities(api, "fjord vik");
    await getBookingCourts(api, "fjord vik");
    await getBookingSlots(api, "fjord vik", "court & 1", "2026-08-24");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "klubb/fjord%20vik/booking-bootstrap?dato=2026-08-23",
      { auth: "optional", signal: undefined }
    );
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjord%20vik/grener", {
      auth: "optional",
      signal: undefined,
    });
    expect(request).toHaveBeenNthCalledWith(3, "klubb/fjord%20vik/baner", {
      auth: "optional",
      signal: undefined,
    });
    expect(request).toHaveBeenNthCalledWith(
      4,
      "klubb/fjord%20vik/kalender?baneId=court+%26+1&dato=2026-08-24",
      { auth: "optional", signal: undefined }
    );
  });

  it("sender typed booking, avbestilling og arrangementvalg", async () => {
    const request = vi.fn().mockResolvedValue({ melding: "OK" });
    const api = { request: request as ApiClient["request"] };
    const booking = {
      baneId: "court-1",
      dato: "2026-08-23",
      startTid: "10:00",
      sluttTid: "11:00",
      arrangementId: "event-1",
    };

    await createBooking(api, "fjordvik", booking);
    await cancelBooking(api, "fjordvik", "booking/1");
    await getActiveArrangements(api, "fjordvik", "activity & 1");

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjordvik/bookinger", {
      auth: "required",
      method: "POST",
      json: booking,
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjordvik/bookinger/booking%2F1", {
      auth: "required",
      method: "DELETE",
    });
    expect(request).toHaveBeenNthCalledWith(
      3,
      "klubb/fjordvik/arrangement/aktive?grenId=activity%20%26%201",
      { auth: "optional", signal: undefined }
    );
  });
});
