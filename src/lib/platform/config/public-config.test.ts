import { describe, expect, it } from "vitest";

import { readPublicConfig, type PublicEnvironment } from "./public-config";

const emptyEnvironment: PublicEnvironment = {};

describe("readPublicConfig", () => {
  it("bruker stabil standardslug og normaliserer offentlige verdier", () => {
    expect(
      readPublicConfig({
        ...emptyEnvironment,
        VITE_API_BASE_URL: "https://api.example.test/",
        VITE_TENANT_SLUG: " AAS-Tennisklubb ",
        VITE_ENABLE_IDRETTENS_ID: "true",
      })
    ).toMatchObject({
      apiBaseUrl: "https://api.example.test",
      defaultSlug: "aas-tennisklubb",
      tenantSlug: "aas-tennisklubb",
      enableIdrettensId: true,
    });
  });

  it("avviser en slug som ikke kan brukes som tenantsegment", () => {
    expect(() =>
      readPublicConfig({ ...emptyEnvironment, VITE_DEFAULT_SLUG: "Ikke en slug" })
    ).toThrow("VITE_DEFAULT_SLUG må være en URL-vennlig slug.");
  });
});
