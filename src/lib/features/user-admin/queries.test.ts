import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { userBookingsQueryOptions } from "./queries";

describe("user booking query", () => {
  it("isolerer cache per klubb og bruker og henter ikke uten kapabilitet", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as ApiClient;
    const options = userBookingsQueryOptions(api, "aas", "ola", true);
    expect(options.queryKey).not.toEqual(
      userBookingsQueryOptions(api, "annen", "ola", true).queryKey
    );
    expect(options.queryKey).not.toEqual(
      userBookingsQueryOptions(api, "aas", "kari", true).queryKey
    );
    expect(userBookingsQueryOptions(api, "aas", "ola", false).enabled).toBe(false);
    expect(userBookingsQueryOptions(api, "aas", "", true).enabled).toBe(false);
    const signal = new AbortController().signal;
    await options.queryFn({ signal });
    expect(request).toHaveBeenCalledWith("klubb/aas/bruker/admin/bruker/ola/bookinger", {
      auth: "required",
      signal,
    });
  });
});
