import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  cancelMyBooking,
  deleteMyAccount,
  getMyAccountData,
  getMyBookings,
  updateMyProfile,
} from "./api";

describe("account API", () => {
  it("sender Mine tider-kall med eksplisitt historikkfilter og encoded identifikatorer", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;
    const signal = new AbortController().signal;

    await getMyBookings(api, "fjord vik", false, signal);
    await getMyBookings(api, "fjord vik", true, signal);
    await cancelMyBooking(api, "fjord vik", "booking/1");

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjord%20vik/bookinger/mine", {
      auth: "required",
      signal,
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "klubb/fjord%20vik/bookinger/mine?inkluderHistoriske=true",
      { auth: "required", signal }
    );
    expect(request).toHaveBeenNthCalledWith(3, "klubb/fjord%20vik/bookinger/booking%2F1", {
      auth: "required",
      method: "DELETE",
    });
  });

  it("sender typed profil-, eksport- og slett-meg-kall", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;

    await updateMyProfile(api, "fjordvik", { visningsnavn: "Ada" });
    await getMyAccountData(api, "fjordvik");
    await deleteMyAccount(api, "fjordvik");

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjordvik/bruker/meg", {
      auth: "required",
      method: "PATCH",
      json: { visningsnavn: "Ada" },
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjordvik/bruker/meg/egen-data", {
      auth: "required",
    });
    expect(request).toHaveBeenNthCalledWith(3, "klubb/fjordvik/bruker/meg", {
      auth: "required",
      method: "DELETE",
    });
  });
});
