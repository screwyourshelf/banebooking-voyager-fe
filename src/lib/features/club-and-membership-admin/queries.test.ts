import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  activateMembershipMutationOptions,
  membershipStatusQueryOptions,
  updateClubMutationOptions,
} from "./queries";

describe("club and membership admin queries", () => {
  it("eier tenantnøklet medlemsstatus", () => {
    const api = { request: vi.fn() } as unknown as ApiClient;
    expect(membershipStatusQueryOptions(api, "fjordvik").queryKey).toEqual([
      "club-and-membership-admin",
      { slug: "fjordvik" },
      "membership-status",
    ]);
  });

  it("invaliderer hele tenantgrensen etter klubb- og medlemskapsendring", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = { request } as unknown as ApiClient;
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const update = updateClubMutationOptions(api, queryClient, "fjordvik");
    const activate = activateMembershipMutationOptions(api, queryClient, "fjordvik");

    await update.onSuccess();
    await activate.onSuccess();

    expect(invalidate).toHaveBeenCalledTimes(2);
    const predicate = invalidate.mock.calls[0]?.[0]?.predicate;
    expect(predicate!({ queryKey: ["klubb", { slug: "fjordvik" }] } as never)).toBe(true);
    expect(predicate!({ queryKey: ["news", { slug: "fjordvik" }] } as never)).toBe(true);
    expect(predicate!({ queryKey: ["klubb", { slug: "annen" }] } as never)).toBe(false);
  });
});
