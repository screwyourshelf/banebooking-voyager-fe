import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import { createCourt } from "./admin-test-data";
import { courtToDraft, toCourtBookingSettingsRequest, toCourtUpdateRequest } from "./model";
import {
  adminActivitiesQueryOptions,
  adminCourtsQueryOptions,
  saveCourtMutationOptions,
} from "./queries";

describe("court admin mutations", () => {
  it("deler kanoniske ressursnøkler med andre beskyttede konsumenter", () => {
    const api = { request: vi.fn() } as unknown as ApiClient;

    expect(adminActivitiesQueryOptions(api, "fjordvik").queryKey).toEqual([
      "tenant-resource",
      { slug: "fjordvik" },
      "activities",
      { auth: "required", includeInactive: true },
    ]);
    expect(adminCourtsQueryOptions(api, "fjordvik").queryKey).toEqual([
      "tenant-resource",
      { slug: "fjordvik" },
      "courts",
      { auth: "required", includeInactive: true },
    ]);
  });

  it("lagrer banedata og overstyringer sekvensielt og invaliderer berørte ressurser", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const court = createCourt();
    const draft = { ...courtToDraft(court), name: "Bane A", overrides: null };
    const options = saveCourtMutationOptions(api, queryClient, "fjordvik");

    await options.mutationFn({
      bookingSettingsChanged: true,
      bookingSettingsRequest: toCourtBookingSettingsRequest(draft.overrides),
      courtChanged: true,
      courtId: court.id,
      courtRequest: toCourtUpdateRequest(court, draft),
    });
    await options.onSuccess();

    expect(request).toHaveBeenNthCalledWith(1, "klubb/fjordvik/baner/court-1", {
      auth: "required",
      method: "PUT",
      json: expect.objectContaining({ navn: "Bane A" }),
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "klubb/fjordvik/baner/court-1/booking-innstillinger",
      { auth: "required", method: "PUT", json: expect.objectContaining({ aapningstid: null }) }
    );
    expect(invalidate).toHaveBeenCalledWith({ predicate: expect.any(Function) });
    const predicate = invalidate.mock.calls.at(0)?.[0]?.predicate;
    expect(predicate).toBeTypeOf("function");
    expect(
      predicate!({
        meta: tenantQueryMeta("fjordvik", "booking-slots"),
        queryKey: ["booking", { slug: "fjordvik" }],
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
  });
});
