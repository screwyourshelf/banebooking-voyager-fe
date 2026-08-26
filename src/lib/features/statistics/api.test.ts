import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import { getBookingStatistics, getStatisticsActivities, getStatisticsCourts } from "./api";

describe("statistics API", () => {
  it("koder tenant og sender hele filterkontrakten til bookingstatistikken", async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = { request } as unknown as ApiClient;

    await getBookingStatistics(api, "fjord vik", {
      fra: "2026-01-01",
      til: "2026-08-23",
      sammenlignMedForrigeÅr: true,
      grenId: "gren/id",
      baneId: "bane id",
    });

    expect(request).toHaveBeenCalledWith(
      "klubb/fjord%20vik/statistikk/bookinger?fra=2026-01-01&til=2026-08-23&" +
        "sammenlignMedForrige%C3%85r=true&grenId=gren%2Fid&baneId=bane+id",
      { auth: "required", signal: undefined }
    );
  });

  it("henter filtergrunnlaget fra de eksisterende gren- og baneendepunktene", async () => {
    const request = vi.fn().mockResolvedValue([]);
    const api = { request } as unknown as ApiClient;

    await getStatisticsActivities(api, "fjordvik");
    await getStatisticsCourts(api, "fjordvik");

    expect(request.mock.calls).toEqual([
      ["klubb/fjordvik/grener?inkluderInaktive=true", { auth: "required", signal: undefined }],
      ["klubb/fjordvik/baner?inkluderInaktive=true", { auth: "required", signal: undefined }],
    ]);
  });
});
