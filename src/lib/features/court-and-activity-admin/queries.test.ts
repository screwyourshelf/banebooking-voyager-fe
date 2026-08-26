import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { createCourt } from "./admin-test-data";
import { courtToDraft, toCourtBookingSettingsRequest, toCourtUpdateRequest } from "./model";
import { saveCourtMutationOptions } from "./queries";

describe("court admin mutations", () => {
  it("lagrer banedata og overstyringer sekvensielt og invaliderer hele tenantgrensen", async () => {
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
      method: "PUT",
      json: expect.objectContaining({ navn: "Bane A" }),
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "klubb/fjordvik/baner/court-1/booking-innstillinger",
      { method: "PUT", json: expect.objectContaining({ aapningstid: null }) }
    );
    expect(invalidate).toHaveBeenCalledWith({ predicate: expect.any(Function) });
    const predicate = invalidate.mock.calls.at(0)?.[0]?.predicate;
    expect(predicate).toBeTypeOf("function");
    expect(predicate!({ queryKey: ["booking", { slug: "fjordvik" }] } as never)).toBe(true);
    expect(predicate!({ queryKey: ["booking", { slug: "annen" }] } as never)).toBe(false);
  });
});
