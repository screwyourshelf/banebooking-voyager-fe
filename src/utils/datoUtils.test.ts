import { describe, expect, it } from "vitest";

import { formaterDatoGruppe } from "./datoUtils";

describe("formaterDatoGruppe", () => {
  const referanseDato = new Date(2026, 7, 21);

  it("bruker samme datopresentasjon for i dag", () => {
    expect(formaterDatoGruppe("2026-08-21", referanseDato)).toEqual({
      relativeLabel: "I dag",
      label: "Fredag 21. august",
    });
  });

  it("bruker samme datopresentasjon for i morgen", () => {
    expect(formaterDatoGruppe("2026-08-22", referanseDato)).toEqual({
      relativeLabel: "I morgen",
      label: "Lørdag 22. august",
    });
  });
});
