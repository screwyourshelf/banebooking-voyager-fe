import { describe, expect, it } from "vitest";
import type { AuthState } from "$lib/platform/auth";
import type { TenantContext } from "$lib/platform/tenant";
import { buildAppNavigationState } from "./navigation-model";

const routeTenant: TenantContext = { slug: "fjordvik", source: "route" };
const anonymous: AuthState = { status: "anonymous", user: null };
const authenticated: AuthState = {
  status: "authenticated",
  user: {
    id: "user-1",
    email: "kari@example.no",
    name: "Kari Nordmann",
    source: "supabase",
  },
};

function buildReady(
  options: {
    auth?: AuthState;
    capabilities?: string[];
    pathname?: string;
    tenant?: TenantContext;
    basePath?: string;
  } = {}
) {
  const state = buildAppNavigationState({
    auth: options.auth ?? authenticated,
    basePath: options.basePath,
    bruker: {
      status: "success",
      data:
        (options.auth ?? authenticated).status === "authenticated"
          ? {
              id: "user-1",
              epost: "kari@example.no",
              visningsnavn: "Kari",
              roller: ["Medlem"],
              kapabiliteter: options.capabilities ?? [],
            }
          : undefined,
    },
    klubb: {
      status: "success",
      data: { slug: "fjordvik", navn: "Fjordvik Tennisklubb", feedSynligAntallDager: 30 },
    },
    pathname: options.pathname ?? "/fjordvik",
    tenant: options.tenant ?? routeTenant,
  });

  if (state.status !== "ready") throw new Error("Forventet klar navigasjon");
  return state;
}

describe("app navigation model", () => {
  it("keeps navigation loading until auth, club and authenticated user state are settled", () => {
    expect(
      buildAppNavigationState({
        auth: { status: "initializing", user: null },
        bruker: { status: "pending", data: undefined },
        klubb: { status: "pending", data: undefined },
        pathname: "/fjordvik",
        tenant: routeTenant,
      })
    ).toEqual({ status: "loading", label: "Laster navigasjon …" });

    expect(
      buildAppNavigationState({
        auth: authenticated,
        bruker: { status: "pending", data: undefined },
        klubb: {
          status: "success",
          data: { slug: "fjordvik", navn: "Fjordvik", feedSynligAntallDager: 30 },
        },
        pathname: "/fjordvik",
        tenant: routeTenant,
      }).status
    ).toBe("loading");
  });

  it("uses a stable identity fallback when the club query has failed", () => {
    const state = buildAppNavigationState({
      auth: anonymous,
      bruker: { status: "pending", data: undefined },
      klubb: { status: "error", data: undefined },
      pathname: "/fjordvik",
      tenant: routeTenant,
    });

    expect(state.status).toBe("ready");
    if (state.status === "ready") expect(state.identity.name).toBe("Banebooking");
  });

  it("hides personal and admin destinations for anonymous users", () => {
    const state = buildReady({ auth: anonymous });

    expect(state.desktopSections.map((section) => section.id)).toEqual(["overview"]);
    expect(
      state.desktopSections.flatMap((section) => section.items.map((item) => item.id))
    ).toEqual(["booking", "arrangementer", "nyheter"]);
    expect(state.account.authenticated).toBe(false);
  });

  it("uses backend capabilities to expose only permitted admin destinations", () => {
    const state = buildReady({ capabilities: ["grener:admin", "statistikk:lese"] });
    const admin = state.desktopSections.find((section) => section.id === "admin");

    expect(admin?.items.map((item) => item.id)).toEqual(["baner-og-grener", "statistikk"]);
  });

  it("marks the shared courts destination active on both court and activity routes", () => {
    const state = buildReady({
      capabilities: ["grener:admin"],
      pathname: "/fjordvik/admin/grener",
    });

    expect(
      state.desktopSections
        .flatMap((section) => section.items)
        .find((item) => item.id === "baner-og-grener")?.active
    ).toBe(true);
  });

  it("markerer percent-kodet norsk adminroute som aktiv", () => {
    const state = buildReady({
      capabilities: ["kunngjøring:admin"],
      pathname: "/fjordvik/admin/kunngj%C3%B8ringer",
    });

    expect(
      state.desktopSections
        .flatMap((section) => section.items)
        .find((item) => item.id === "kunngjoringer")?.active
    ).toBe(true);

    const encodedSeparator = buildReady({
      capabilities: ["kunngjøring:admin"],
      pathname: "/fjordvik/admin/ukjent%2Fkunngj%C3%B8ringer",
    });
    expect(
      encodedSeparator.desktopSections
        .flatMap((section) => section.items)
        .find((item) => item.id === "kunngjoringer")?.active
    ).toBe(false);
  });

  it("keeps the three authenticated mobile priorities out of the More menu", () => {
    const state = buildReady();
    const primaryIds = state.mobilePrimary.map((item) => item.id);
    const secondaryIds = state.mobileSecondary.flatMap((section) =>
      section.items.map((item) => item.id)
    );

    expect(primaryIds).toEqual(["booking", "bookinger", "arrangementer"]);
    expect(secondaryIds).toContain("minside");
    expect(secondaryIds).not.toContain("nyheter");
    expect(secondaryIds.every((id) => !primaryIds.includes(id))).toBe(true);
  });

  it("builds direct links and active state for route and dedicated tenants under a base path", () => {
    const routed = buildReady({ basePath: "/banebooking", pathname: "/banebooking/fjordvik" });
    const dedicated = buildReady({
      basePath: "/banebooking",
      pathname: "/banebooking/arrangementer",
      tenant: { slug: "fjordvik", source: "build" },
    });

    expect(routed.identity.href).toBe("/banebooking/fjordvik");
    expect(routed.identity.logoSources).toEqual([
      "/banebooking/klubber/fjordvik/img/logo.svg",
      "/banebooking/klubber/fjordvik/img/logo.webp",
      "/banebooking/klubber/default/img/logo.svg",
    ]);
    expect(routed.mobilePrimary[0]).toMatchObject({ href: "/banebooking/fjordvik", active: true });
    expect(dedicated.identity.href).toBe("/banebooking");
    expect(dedicated.mobilePrimary.find((item) => item.id === "arrangementer")).toMatchObject({
      href: "/banebooking/arrangementer",
      active: true,
    });
  });
});
