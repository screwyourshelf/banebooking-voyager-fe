import { describe, expect, it } from "vitest";

import type { ArrangementForhåndsvisningRespons } from "@/types";
import type { LokalBooking } from "../types";
import { mergeKonfliktStatus } from "./useKonfliktSjekk";

function lagBooking(overrides: Partial<LokalBooking> = {}): LokalBooking {
  return {
    id: "booking",
    dato: "2026-08-15",
    startTid: "08:00",
    sluttTid: "09:00",
    baneId: "bane-a",
    baneNavn: "Bane A",
    status: "ukjent",
    kilde: "generert",
    ...overrides,
  };
}

function lagSvar(type: keyof ArrangementForhåndsvisningRespons): ArrangementForhåndsvisningRespons {
  const slot = {
    dato: "2026-08-15",
    startTid: "08:00",
    sluttTid: "09:00",
    baneId: "bane-a",
    baneNavn: "Bane A",
  };

  return {
    ledige: type === "ledige" ? [slot] : [],
    konflikter: type === "konflikter" ? [slot] : [],
  };
}

describe("mergeKonfliktStatus", () => {
  it("gir konfliktraden en lesbar forklaring", () => {
    const [resultat] = mergeKonfliktStatus([lagBooking()], lagSvar("konflikter"));

    expect(resultat.status).toBe("konflikt");
    expect(resultat.konfliktInfo).toBe("Tidspunktet er allerede opptatt.");
  });

  it("rydder konfliktinformasjonen når tiden blir ledig", () => {
    const [resultat] = mergeKonfliktStatus(
      [lagBooking({ status: "konflikt", konfliktInfo: "Opptatt" })],
      lagSvar("ledige")
    );

    expect(resultat.status).toBe("ledig");
    expect(resultat.konfliktInfo).toBeUndefined();
  });
});
