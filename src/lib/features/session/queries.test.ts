import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { feedStatusQueryOptions } from "./queries";

describe("session navigation queries", () => {
  it("cacher tenantens feedstatus i ti minutter", async () => {
    const request = vi.fn().mockResolvedValue({ antallNyheter: 4 });
    const api = { request } as unknown as ApiClient;
    const options = feedStatusQueryOptions(api, "fjordvik");
    const controller = new AbortController();

    expect(options.queryKey).toEqual(["feed-status", { slug: "fjordvik" }]);
    expect(options.meta).toEqual({
      tenantQuery: { resources: ["news"], slug: "fjordvik" },
    });
    expect(options.staleTime).toBe(10 * 60_000);
    await expect(options.queryFn({ signal: controller.signal })).resolves.toEqual({
      antallNyheter: 4,
    });
    expect(request).toHaveBeenCalledOnce();
  });
});
