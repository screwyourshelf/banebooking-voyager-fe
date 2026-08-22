import { QueryClient } from "@tanstack/svelte-query";
import { describe, expect, it, vi } from "vitest";
import { invalidateSessionBruker, sessionQueryKeys } from "./query-keys";

describe("session query keys", () => {
  it("invaliderer bare guardbrukeren for gjeldende tenant", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

    await invalidateSessionBruker(queryClient, "fjordvik");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: sessionQueryKeys.bruker("fjordvik") });
    expect(sessionQueryKeys.bruker("fjordvik")).toEqual(["bruker", { slug: "fjordvik" }]);
  });
});
