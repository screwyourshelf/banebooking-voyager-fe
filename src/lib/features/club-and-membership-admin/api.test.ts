import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  activateMembershipConfirmation,
  deactivateMembershipConfirmation,
  getMembershipStatus,
  updateClub,
} from "./api";

describe("club and membership admin API", () => {
  it("bevarer typed klubb- og medlemskapsendepunkter", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const signal = new AbortController().signal;
    const clubRequest = {
      navn: "Fjordvik Tennisklubb",
      kontaktEpost: "post@fjordvik.no",
      nettside: "https://fjordvik.no",
      latitude: 59.1,
      longitude: 10.2,
      feedUrl: "https://fjordvik.no/feed",
      feedSynligAntallDager: 30,
    };
    const activationRequest = {
      label: "Sesong 2027",
      gyldigTil: "2027-05-01T00:00:00.000Z",
    };

    await updateClub(api, "fjord vik", clubRequest);
    await getMembershipStatus(api, "fjord vik", signal);
    await activateMembershipConfirmation(api, "fjord vik", activationRequest);
    await deactivateMembershipConfirmation(api, "fjord vik");

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjord%20vik", {
      method: "PUT",
      json: clubRequest,
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/fjord%20vik/medlemskap/status", {
      signal,
    });
    expect(request).toHaveBeenNthCalledWith(3, "klubb/fjord%20vik/medlemskap/aktiver", {
      method: "POST",
      json: activationRequest,
    });
    expect(request).toHaveBeenNthCalledWith(4, "klubb/fjord%20vik/medlemskap/aktiver", {
      method: "DELETE",
    });
  });
});
