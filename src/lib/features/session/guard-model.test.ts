import { describe, expect, it } from "vitest";
import type { BrukerRespons } from "$lib/contracts";
import {
  hasAnyRequiredCapability,
  requiredCapabilitiesForPath,
  resolvePolicyRedirect,
} from "./guard-model";

function bruker(overrides: Partial<BrukerRespons> = {}): BrukerRespons {
  return {
    id: "user-1",
    epost: "a@example.no",
    visningsnavn: "Ada",
    roller: ["Medlem"],
    kapabiliteter: [],
    ...overrides,
  };
}

const tenant = { slug: "askim-tennis", source: "route" as const };

function redirectFor(path: string, value: BrukerRespons) {
  return resolvePolicyRedirect({
    bruker: value,
    currentUrl: new URL(`https://app.test${path}`),
    tenant,
  });
}

describe("session guards", () => {
  it("håndhever sperre, kunngjøring og medlemskap i fast rekkefølge", () => {
    const allBlocked = bruker({
      erSperret: true,
      ulestKunngjøring: { id: "k-1", tittel: "Viktig", tekst: "Les" },
      måBekrefteMedlemskap: true,
    });
    expect(redirectFor("/askim-tennis/bookinger", allBlocked)).toBe("/askim-tennis/sperret");
    expect(redirectFor("/askim-tennis/sperret", allBlocked)).toBeNull();

    expect(
      redirectFor(
        "/askim-tennis/bookinger",
        bruker({ ulestKunngjøring: allBlocked.ulestKunngjøring })
      )
    ).toBe("/askim-tennis/kunngjøring");
    expect(
      redirectFor(
        "/askim-tennis/kunngjøring",
        bruker({ ulestKunngjøring: allBlocked.ulestKunngjøring })
      )
    ).toBeNull();
    expect(redirectFor("/askim-tennis/bookinger", bruker({ måBekrefteMedlemskap: true }))).toBe(
      "/askim-tennis/bekreft-medlemskap"
    );
  });

  it("sender innlogget bruker bort fra en avsluttet guardflate", () => {
    expect(redirectFor("/askim-tennis/sperret", bruker())).toBe("/askim-tennis");
    expect(redirectFor("/askim-tennis/kunngjøring", bruker())).toBe("/askim-tennis");
  });

  it("bruker any-of for brukeradministrasjon og eksakt kapabilitet ellers", () => {
    const brukere = requiredCapabilitiesForPath("/askim-tennis/admin/brukere");
    expect(brukere).not.toBeNull();
    if (!brukere) throw new Error("Adminpath mangler guardregel");
    expect(hasAnyRequiredCapability(bruker({ kapabiliteter: ["brukere:lese"] }), brukere)).toBe(
      true
    );
    const klubb = requiredCapabilitiesForPath("/askim-tennis/admin/klubb");
    if (!klubb) throw new Error("Adminpath mangler guardregel");
    expect(hasAnyRequiredCapability(bruker({ kapabiliteter: ["baner:admin"] }), klubb)).toBe(false);
  });

  it("krever en eksplisitt guardregel for hver adminpath", () => {
    expect(requiredCapabilitiesForPath("/askim-tennis/admin/ukjent")).toBeNull();
  });

  it("matcher norske adminpaths slik nettleseren percent-koder dem", () => {
    expect(requiredCapabilitiesForPath("/askim-tennis/admin/kunngj%C3%B8ringer")).toEqual([
      "kunngjøring:admin",
    ]);
    expect(
      requiredCapabilitiesForPath("/askim-tennis/admin/ukjent%2Fkunngj%C3%B8ringer")
    ).toBeNull();
  });
});
