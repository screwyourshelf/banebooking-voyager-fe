import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { getNews } from "./api";

describe("news API", () => {
  it("henter offentlig klubbfeed med encoded tenant", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;
    const signal = new AbortController().signal;

    await getNews(api, "fjord vik", signal);

    expect(request).toHaveBeenCalledWith("klubb/fjord%20vik/feed", { auth: "none", signal });
  });
});
