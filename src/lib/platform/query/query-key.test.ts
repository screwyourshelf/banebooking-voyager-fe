import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import { invalidateTenantResources, tenantQueryMeta } from "./query-key";

describe("tenant query resources", () => {
  it("matcher bare eksplisitte ressurser for samme tenant", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await invalidateTenantResources(queryClient, "fjordvik", ["courts", "booking-slots"]);

    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(predicate).toBeTypeOf("function");
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "courts"),
        queryKey: ["court-admin", { slug: "fjordvik" }],
      } as never)
    ).toBe(true);
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "user"),
        queryKey: ["session", { slug: "fjordvik" }],
      } as never)
    ).toBe(false);
    expect(
      predicate!({
        meta: tenantQueryMeta("annen", "courts"),
        queryKey: ["court-admin", { slug: "annen" }],
      } as never)
    ).toBe(false);
    expect(predicate!({ queryKey: ["legacy", { slug: "fjordvik" }] } as never)).toBe(false);
  });

  it("kan skjerme en cache som er oppdatert direkte", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    await invalidateTenantResources(queryClient, "fjordvik", ["arrangements"], {
      excludeScopes: ["arrangement-admin"],
    });

    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "arrangements"),
        queryKey: ["arrangement-admin", { slug: "fjordvik" }, "arrangements"],
      } as never)
    ).toBe(false);
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "arrangements"),
        queryKey: ["arrangements", { slug: "fjordvik" }],
      } as never)
    ).toBe(true);
  });
});
