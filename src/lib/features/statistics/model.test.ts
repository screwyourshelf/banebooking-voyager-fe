import { describe, expect, it } from "vitest";
import type { BaneRespons, BookingstatistikkRespons } from "$lib/contracts";
import {
  applyActivityFilter,
  applyFromDate,
  applyPeriodSelection,
  createStatisticsFilters,
  periodFor,
  selectMemberStatistics,
} from "./model";

describe("statistics model", () => {
  const referenceDate = new Date(2026, 7, 23, 12);

  it("bygger de tre faste periodene fra lokal kalenderdato", () => {
    expect(periodFor("året-så-langt", referenceDate)).toEqual({
      fra: "2026-01-01",
      til: "2026-08-23",
    });
    expect(periodFor("forrige-år", referenceDate)).toEqual({
      fra: "2025-01-01",
      til: "2025-12-31",
    });
    expect(periodFor("siste-12", referenceDate)).toEqual({
      fra: "2025-08-24",
      til: "2026-08-23",
    });
  });

  it("beholder customperioden og flytter sluttdato frem når ny start passerer den", () => {
    const initial = createStatisticsFilters(referenceDate);
    expect(applyPeriodSelection(initial, "egendefinert", referenceDate)).toBe(initial);
    expect(applyFromDate({ ...initial, til: "2026-04-01" }, "2026-05-02")).toMatchObject({
      fra: "2026-05-02",
      til: "2026-05-02",
    });
  });

  it("fjerner valgt bane når grenfilteret gjør den ugyldig", () => {
    const filters = {
      ...createStatisticsFilters(referenceDate),
      grenId: "activity-a",
      baneId: "court-a",
    };
    const courts = [{ id: "court-a", grenId: "activity-a" }] as BaneRespons[];

    expect(applyActivityFilter(filters, "activity-a", courts).baneId).toBe("court-a");
    expect(applyActivityFilter(filters, "activity-b", courts).baneId).toBeNull();
    expect(applyActivityFilter(filters, null, courts).baneId).toBeNull();
  });

  it("velger medlemsaggregatet for aktiv bookingtype", () => {
    const all = { aktiveBrukere: 3 };
    const regular = { aktiveBrukere: 2 };
    const event = { aktiveBrukere: 1 };
    const statistics = {
      medlemmer: all,
      medlemmerPerBookingtype: { vanlige: regular, arrangement: event },
    } as BookingstatistikkRespons;

    expect(selectMemberStatistics(statistics, "alle")).toBe(all);
    expect(selectMemberStatistics(statistics, "vanlige")).toBe(regular);
    expect(selectMemberStatistics(statistics, "arrangement")).toBe(event);
  });
});
