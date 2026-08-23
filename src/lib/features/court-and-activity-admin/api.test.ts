import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  createActivity,
  createCourt,
  getAdminActivities,
  getAdminCourts,
  updateActivity,
  updateCourt,
  updateCourtBookingSettings,
} from "./api";

describe("court and activity admin API", () => {
  it("henter inaktive baner og grener gjennom tenantkodede endepunkter", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;
    const signal = new AbortController().signal;

    await getAdminCourts(api, "fjord vik", signal);
    await getAdminActivities(api, "fjord vik", signal);

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjord%20vik/baner?inkluderInaktive=true", {
      signal,
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjord%20vik/grener?inkluderInaktive=true", {
      signal,
    });
  });

  it("bevarer typed opprettings-, redigerings- og bookinginnstillingskontrakter", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const courtCreate = { grenId: "activity-1", navn: "Bane 3", sortering: 2 };
    const courtUpdate = { ...courtCreate, aktiv: false };
    const bookingUpdate = {
      aapningstid: "08:00",
      stengetid: null,
      slotLengdeMinutter: null,
      maksPerDag: null,
      maksTotalt: null,
      dagerFremITid: null,
    };
    const activityCreate = {
      navn: "Padel",
      sortering: 1,
      aapningstid: "07:00",
      stengetid: "22:00",
      maksPerDag: 2,
      maksTotalt: 5,
      dagerFremITid: 7,
      slotLengdeMinutter: 60,
    };

    await createCourt(api, "fjordvik", courtCreate);
    await updateCourt(api, "fjordvik", "court/1", courtUpdate);
    await updateCourtBookingSettings(api, "fjordvik", "court/1", bookingUpdate);
    await createActivity(api, "fjordvik", activityCreate);
    await updateActivity(api, "fjordvik", "activity/1", { ...activityCreate, aktiv: true });

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjordvik/baner", {
      method: "POST",
      json: courtCreate,
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjordvik/baner/court%2F1", {
      method: "PUT",
      json: courtUpdate,
    });
    expect(request).toHaveBeenNthCalledWith(
      3,
      "klubb/fjordvik/baner/court%2F1/booking-innstillinger",
      { method: "PUT", json: bookingUpdate }
    );
    expect(request).toHaveBeenNthCalledWith(4, "klubb/fjordvik/grener", {
      method: "POST",
      json: activityCreate,
    });
    expect(request).toHaveBeenNthCalledWith(5, "klubb/fjordvik/grener/activity%2F1", {
      method: "PUT",
      json: { ...activityCreate, aktiv: true },
    });
  });
});
