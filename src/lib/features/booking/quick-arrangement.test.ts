import { describe, expect, it } from "vitest";
import { ARRANGEMENT_KATEGORI_VALG, Kapabiliteter } from "$lib/domain";
import { createSlot } from "./booking-test-data";
import { quickArrangementRequest, type QuickArrangementDraft } from "./quick-arrangement";

const draft: QuickArrangementDraft = {
  description: "  For alle  ",
  category: "Trening",
};
const slot = createSlot({ kapabiliteter: [Kapabiliteter.booking.kobleTilArrangement] });

describe("hurtigarrangement", () => {
  it("sender valgte tider én gang i kronologisk rekkefølge med samme bane og dato", () => {
    const next = { ...slot, slotStartTid: "12:00", slotSluttTid: "13:00" };
    expect(quickArrangementRequest("tennis", draft, [next, slot, next])).toEqual({
      grenId: "tennis",
      tittel: "Trening",
      beskrivelse: "For alle",
      kategori: "Trening",
      publisertPåNettsiden: false,
      startDato: slot.dato,
      sluttDato: slot.dato,
      ukedager: ["Sunday"],
      baneGrupper: [{ baneIder: [slot.baneId], tidspunkter: ["10:00", "12:00"] }],
      eksplisitteSlots: [
        { baneId: slot.baneId, dato: slot.dato, startTid: "10:00", sluttTid: "11:00" },
        { baneId: slot.baneId, dato: slot.dato, startTid: "12:00", sluttTid: "13:00" },
      ],
    });
  });

  it.each([
    { baneId: "annen-bane" },
    { dato: "2026-08-24" },
    { erPassert: true },
    { bookingId: "opptatt" },
    { kapabiliteter: [Kapabiliteter.booking.book] },
  ])("avviser blandet eller utilgjengelig utvalg: %o", (overrides) => {
    expect(quickArrangementRequest("tennis", draft, [slot, { ...slot, ...overrides }])).toBeNull();
  });

  it.each(ARRANGEMENT_KATEGORI_VALG)(
    "bruker typen $label som tittel uten beskrivelse",
    ({ value, label }) => {
      const request = quickArrangementRequest("tennis", { category: value, description: "   " }, [
        slot,
      ]);
      expect(request).toMatchObject({ tittel: label, kategori: value });
      expect(request?.beskrivelse).toBeUndefined();
    }
  );

  it("krever tider og gren", () => {
    expect(quickArrangementRequest("tennis", draft, [])).toBeNull();
    expect(quickArrangementRequest("", draft, [slot])).toBeNull();
  });
});
