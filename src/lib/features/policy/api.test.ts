import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { confirmMembership, confirmRequiredAnnouncement } from "./api";

describe("protected policy endpoints", () => {
  it("bekrefter eksakt kunngjøring for tenant", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;

    await confirmRequiredAnnouncement(api, "askim tennis", "nyhet/1");

    expect(request).toHaveBeenCalledWith("klubb/askim%20tennis/kunngjøringer/nyhet%2F1/bekreft", {
      method: "POST",
    });
  });

  it("sender trimmet medlemskapskontrakt til brukerendpointet", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const body = { fulltNavn: "Ada Lovelace", medlemskapType: "Voksen" };

    await confirmMembership(api, "askim-tennis", body);

    expect(request).toHaveBeenCalledWith("klubb/askim-tennis/bruker/bekreft-medlemskap", {
      method: "POST",
      json: body,
    });
  });
});
