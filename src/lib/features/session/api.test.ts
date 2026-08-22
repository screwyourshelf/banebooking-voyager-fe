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

    await expect(getKlubb(api, "askim-tennis")).resolves.toBe(klubb);
    expect(request).toHaveBeenCalledWith("klubb/askim-tennis");
  });

  it("aksepterer aktive vilkår én gang og henter guardbrukeren på nytt", async () => {
    const first: BrukerRespons = {
      id: "user-1",
      epost: "a@example.no",
      visningsnavn: "Ada",
      roller: ["Medlem"],
      kapabiliteter: [],
      vilkårAkseptertDato: null,
    };
    const accepted = { ...first, vilkårAkseptertDato: "2026-08-22" };
    const request = vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(accepted);
    const api = { request } as unknown as ApiClient;

    await expect(getBrukerWithCurrentTermsAcceptance(api, "askim-tennis")).resolves.toEqual(
      accepted
    );
    expect(request).toHaveBeenNthCalledWith(2, "klubb/askim-tennis/bruker/vilkaar", {
      method: "POST",
      json: { versjon: "2026-08-22" },
    });
    expect(request).toHaveBeenCalledTimes(3);
  });
});
