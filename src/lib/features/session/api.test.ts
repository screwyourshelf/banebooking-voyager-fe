import { describe, expect, it, vi } from "vitest";
import type { BrukerRespons, KlubbRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { getBrukerWithCurrentTermsAcceptance, getKlubb } from "./api";

describe("session endpoints", () => {
  it("bruker typed tenantpath for klubb", async () => {
    const klubb: KlubbRespons = {
      slug: "askim-tennis",
      navn: "Askim Tennisklubb",
      feedSynligAntallDager: 14,
    };
    const request = vi.fn().mockResolvedValue(klubb);
    const api = { request } as unknown as ApiClient;
    const controller = new AbortController();

    await expect(getKlubb(api, "askim-tennis", controller.signal)).resolves.toBe(klubb);
    expect(request).toHaveBeenCalledWith("klubb/askim-tennis", {
      auth: "none",
      signal: controller.signal,
    });
  });

  it("aksepterer aktive vilkår og bruker den oppdaterte profilen fra POST-responsen", async () => {
    const first: BrukerRespons = {
      id: "user-1",
      epost: "a@example.no",
      visningsnavn: "Ada",
      roller: ["Medlem"],
      kapabiliteter: [],
      vilkårAkseptertDato: null,
    };
    const accepted = { ...first, vilkårAkseptertDato: "2026-08-22" };
    const request = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(accepted);
    const api = { request } as unknown as ApiClient;
    const controller = new AbortController();

    await expect(
      getBrukerWithCurrentTermsAcceptance(api, "askim-tennis", controller.signal)
    ).resolves.toEqual(accepted);
    expect(request).toHaveBeenNthCalledWith(1, "klubb/askim-tennis/bruker", {
      auth: "required",
      signal: controller.signal,
    });
    expect(request).toHaveBeenNthCalledWith(2, "klubb/askim-tennis/bruker/vilkaar", {
      auth: "required",
      method: "POST",
      json: { versjon: "2026-08-22" },
      signal: controller.signal,
    });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("normaliserer tom anonym respons til null for query-cachen", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;

    await expect(getBrukerWithCurrentTermsAcceptance(api, "askim-tennis")).resolves.toBeNull();
    expect(request).toHaveBeenCalledOnce();
  });
});
