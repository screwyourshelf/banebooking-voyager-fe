import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import {
  bookingStatisticsQueryOptions,
  statisticsActivitiesQueryOptions,
  statisticsCourtsQueryOptions,
} from "./queries";

describe("statistics queries", () => {
  it("beholder forrige resultat mens et nytt filterresultat hentes", () => {
    const options = bookingStatisticsQueryOptions({ request: vi.fn() } as ApiClient, "fjordvik", {
      fra: "2026-01-01",
      til: "2026-08-23",
      sammenlignMedForrigeÅr: true,
      grenId: null,
      baneId: null,
    });
    const previous = { nøkkeltall: { antallBookinger: 4 } };

    expect(options.placeholderData(previous)).toBe(previous);
    expect(options.queryKey).toEqual([
      "statistics",
      { slug: "fjordvik" },
      "booking",
      "2026-01-01",
      "2026-08-23",
      true,
      null,
      null,
    ]);
  });

  it("bruker de kanoniske, beskyttede ressursnøklene for filtergrunnlaget", () => {
    const api = { request: vi.fn() } as ApiClient;

    expect(statisticsActivitiesQueryOptions(api, "fjordvik").queryKey).toEqual([
      "tenant-resource",
      { slug: "fjordvik" },
      "activities",
      { auth: "required", includeInactive: true },
    ]);
    expect(statisticsCourtsQueryOptions(api, "fjordvik").queryKey).toEqual([
      "tenant-resource",
      { slug: "fjordvik" },
      "courts",
      { auth: "required", includeInactive: true },
    ]);
  });
});
