import { describe, expect, it } from "vitest";
import type { ArrangementForhåndsvisningRespons, BaneRespons } from "$lib/contracts";
import {
  addUniqueBookings,
  createArrangementRequest,
  generateManualBookings,
  generateRecurringBookings,
  groupCourtsBySlotLength,
  mergePreview,
  reconcileBatchResult,
  type LocalBooking,
} from "./model";

function court(id: string, slotLengthMinutes: number): BaneRespons {
  return {
    aktiv: true,
    beskrivelse: "",
    bookingInnstillinger: {
      aapningstid: "08:00",
      dagerFremITid: 30,
      maksPerDag: 2,
      maksKommende: 4,
      slotLengdeMinutter: slotLengthMinutes,
      stengetid: "10:00",
    },
    bookingOverstyring: null,
    grenId: "activity",
    grenNavn: "Tennis",
    harOverstyring: false,
    id,
    kapabiliteter: [],
    navn: id,
    sortering: 0,
  };
}

const draft = {
  activityId: "activity",
  category: "Kurs" as const,
  description: " Internt ",
  publishedOnWebsite: true,
  websiteDescription: '{"type":"doc"}',
  websiteTitle: "Sommerkurs",
};

describe("arrangement-admin model", () => {
  it("genererer gjentakende og manuelle forslag med banens faktiske slotlengde", () => {
    const groups = groupCourtsBySlotLength([court("A", 60), court("B", 30)], ["A", "B"]);
    expect(groups.map((group) => group.slotLengthMinutes)).toEqual([30, 60]);

    const recurring = generateRecurringBookings("2026-08-24", "2026-08-25", ["Monday"], groups, {
      30: ["08:00"],
      60: ["09:00"],
    });
    expect(recurring.map((booking) => [booking.date, booking.courtId, booking.endTime])).toEqual([
      ["2026-08-24", "B", "08:30"],
      ["2026-08-24", "A", "10:00"],
    ]);

    expect(
      generateManualBookings(["2026-08-27"], groups.slice(1), { 60: ["08:00"] })[0]
    ).toMatchObject({ date: "2026-08-27", endTime: "09:00", source: "manual" });
  });

  it("dedupliserer og merger backendens konfliktstatus uten å erstatte staginglisten", () => {
    const [booking] = generateManualBookings(
      ["2026-08-27"],
      groupCourtsBySlotLength([court("A", 60)], ["A"]),
      { 60: ["08:00"] }
    );
    expect(addUniqueBookings([booking], [{ ...booking, id: "duplicate" }])).toHaveLength(1);

    const preview: ArrangementForhåndsvisningRespons = {
      konflikter: [
        { baneId: "A", baneNavn: "A", dato: "2026-08-27", sluttTid: "09:00", startTid: "08:00" },
      ],
      ledige: [],
    };
    expect(mergePreview([booking], preview)[0]).toMatchObject({
      message: "Tidspunktet er allerede opptatt.",
      status: "conflict",
    });
  });

  it("bygger eksplisitt opprettingsrequest og utelater kjente konflikter", () => {
    const bookings: LocalBooking[] = [
      {
        courtId: "A",
        courtName: "A",
        date: "2026-08-24",
        endTime: "09:00",
        id: "ok",
        source: "manual",
        startTime: "08:00",
        status: "available",
      },
      {
        courtId: "A",
        courtName: "A",
        date: "2026-08-24",
        endTime: "10:00",
        id: "bad",
        source: "manual",
        startTime: "09:00",
        status: "conflict",
      },
    ];
    expect(createArrangementRequest(draft, bookings)).toMatchObject({
      eksplisitteSlots: [{ baneId: "A", dato: "2026-08-24", sluttTid: "09:00", startTid: "08:00" }],
      grenId: "activity",
      tittel: "Kurs",
      ukedager: ["Monday"],
    });
  });

  it("beholder bare feilede forslag etter delvis batchsuksess", () => {
    const submitted: LocalBooking[] = [
      {
        courtId: "A",
        courtName: "A",
        date: "2026-08-24",
        endTime: "09:00",
        id: "ok",
        source: "manual",
        startTime: "08:00",
        status: "available",
      },
      {
        courtId: "B",
        courtName: "B",
        date: "2026-08-24",
        endTime: "09:00",
        id: "bad",
        source: "manual",
        startTime: "08:00",
        status: "available",
      },
    ];
    const result = reconcileBatchResult(submitted, {
      feilet: [
        {
          baneId: "B",
          dato: "2026-08-24",
          feilmelding: "Opptatt",
          sluttTid: "09:00",
          startTid: "08:00",
        },
      ],
      opprettet: [],
    });
    expect(result.succeeded.map((booking) => booking.id)).toEqual(["ok"]);
    expect(result.failed[0]).toMatchObject({ id: "bad", message: "Opptatt", status: "conflict" });
  });
});
