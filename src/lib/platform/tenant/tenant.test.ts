import { describe, expect, it } from "vitest";
import {
  buildLoginPath,
  buildTenantPath,
  getCallbackDestination,
  readSafeReturnPath,
  resolveTenant,
  stripBasePath,
} from "./tenant";

describe("tenant contract", () => {
  const routeTenant = { slug: "askim-tennis", source: "route" as const };
  const buildTenant = { slug: "askim-tennis", source: "build" as const };

  it("normaliserer route- og buildtenant til samme interne kontrakt", () => {
    expect(resolveTenant("askim-tennis", { tenantSlug: null })).toEqual(routeTenant);
    expect(resolveTenant(undefined, { tenantSlug: "askim-tennis" })).toEqual(buildTenant);
    expect(resolveTenant("annen-klubb", { tenantSlug: "askim-tennis" })).toEqual(buildTenant);
    expect(resolveTenant(undefined, { tenantSlug: null })).toBeNull();
  });

  it("bygger paths korrekt med og uten slug og base path", () => {
    expect(buildTenantPath(routeTenant, "admin/baner", "/banebooking/")).toBe(
      "/banebooking/askim-tennis/admin/baner"
    );
    expect(buildTenantPath(buildTenant, "admin/baner", "/banebooking/")).toBe(
      "/banebooking/admin/baner"
    );
  });

  it("bevarer et trygt returnTo-mål gjennom login", () => {
    const url = new URL("https://app.test/banebooking/askim-tennis/minside?tab=profil#persondata");
    const login = buildLoginPath(routeTenant, url, "/banebooking");
    expect(login).toContain("/banebooking/askim-tennis/login?returnTo=");
    expect(
      readSafeReturnPath(url.pathname + url.search + url.hash, routeTenant, "/banebooking")
    ).toBe("/banebooking/askim-tennis/minside?tab=profil#persondata");
    expect(readSafeReturnPath("//evil.test", routeTenant, "/banebooking")).toBeNull();
    expect(readSafeReturnPath("/annen-klubb/admin", routeTenant, "/banebooking")).toBeNull();
  });

  it("sender callback til dedikert rot eller sist brukte slug", () => {
    expect(
      getCallbackDestination(
        { defaultSlug: "standard", tenantSlug: "askim-tennis" },
        "ignoreres",
        "/banebooking"
      )
    ).toBe("/banebooking");
    expect(
      getCallbackDestination(
        { defaultSlug: "standard", tenantSlug: null },
        "askim-tennis",
        "/banebooking"
      )
    ).toBe("/banebooking/askim-tennis");
    expect(
      getCallbackDestination(
        { defaultSlug: "standard", tenantSlug: null },
        "../uventet",
        "/banebooking"
      )
    ).toBe("/banebooking/standard");
    expect(
      getCallbackDestination({ defaultSlug: "standard", tenantSlug: null }, "auth", "/banebooking")
    ).toBe("/banebooking/standard");
  });

  it("fjerner base path før intern SvelteKit-navigasjon", () => {
    expect(stripBasePath("/banebooking/askim-tennis/login?returnTo=%2F", "/banebooking")).toBe(
      "/askim-tennis/login?returnTo=%2F"
    );
    expect(stripBasePath("/banebooking", "/banebooking")).toBe("/");
    expect(() => stripBasePath("/annen/askim-tennis", "/banebooking")).toThrow(
      "utenfor konfigurert base path"
    );
  });
});
