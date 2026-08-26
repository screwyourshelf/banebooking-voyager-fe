import { describe, expect, it } from "vitest";
import {
  formaterArrangementMetadata,
  getArrangementLifecycleStatus,
} from "./arrangement-presentation";

describe("arrangement presentation", () => {
  it("uses one lifecycle language for upcoming, ongoing and past arrangements", () => {
    const referenceDate = new Date(2026, 7, 21);

    expect(
      getArrangementLifecycleStatus(
        { erPassert: false, startDato: "2026-08-22", sluttDato: "2026-08-23" },
        referenceDate
      )
    ).toEqual({ label: "Kommende", tone: "event" });
    expect(
      getArrangementLifecycleStatus(
        { erPassert: false, startDato: "2026-08-20", sluttDato: "2026-08-22" },
        referenceDate
      )
    ).toEqual({ label: "Pågår", tone: "event" });
    expect(
      getArrangementLifecycleStatus(
        { erPassert: true, startDato: "2026-08-01", sluttDato: "2026-08-02" },
        referenceDate
      )
    ).toEqual({ label: "Gjennomført", tone: "past" });
  });

  it("does not repeat a category that is already used as the title", () => {
    expect(
      formaterArrangementMetadata({ tittel: "Annet", grenNavn: "Padel", kategori: "Annet" })
    ).toBe("Padel");
    expect(
      formaterArrangementMetadata({
        tittel: "Sommercup",
        grenNavn: "Tennis",
        kategori: "Turnering",
      })
    ).toBe("Tennis · Turnering");
  });
});
