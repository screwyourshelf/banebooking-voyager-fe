import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { cancelArrangement, getArrangements } from "./api";

describe("arrangement API", () => {
  it("velger offentlig eller innlogget liste og bevarer historikkparameteren", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;
    const signal = new AbortController().signal;

    await getArrangements(api, "fjord vik", false, false, signal);
    await getArrangements(api, "fjord vik", true, true, signal);

    expect(request).toHaveBeenNthCalledWith(
      1,
      "offentlig/klubb/fjord%20vik/arrangementer/visning",
      { auth: "none", signal }
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "klubb/fjord%20vik/arrangementer?inkluderHistoriske=true",
      { auth: "required", signal }
    );
  });

  it("encoder arrangementidentifikatoren ved avlysning", async () => {
    const request = vi.fn().mockResolvedValue({ arrangementId: "event/1" });
    const api = { request } as unknown as ApiClient;

    await cancelArrangement(api, "fjordvik", "event/1");

    expect(request).toHaveBeenCalledWith("klubb/fjordvik/arrangement/event%2F1", {
      auth: "required",
      method: "DELETE",
    });
  });
});
