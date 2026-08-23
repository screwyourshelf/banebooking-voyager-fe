import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { arrangementQueryKeys } from "./query-keys";
import { cancelArrangementMutationOptions } from "./queries";

describe("arrangement mutation", () => {
  it("invaliderer alle tenantens arrangementvarianter etter avlysning", async () => {
    const request = vi.fn().mockResolvedValue({ arrangementId: "event-1" });
    const api = { request } as unknown as ApiClient;
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const options = cancelArrangementMutationOptions(api, queryClient, "fjordvik");

    await options.mutationFn("event-1");
    await options.onSettled();

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: arrangementQueryKeys.all("fjordvik"),
    });
  });
});
