import { describe, expect, it } from "vitest";
import type { BrukerRespons } from "$lib/contracts";
import {
  createDisplayNameDraft,
  resolveAccountTab,
  resolveDisplayName,
  validateDisplayName,
} from "./model";

const user: BrukerRespons = {
  id: "user-1",
  epost: "ada@example.no",
  visningsnavn: "Ada",
  roller: ["Medlem"],
  kapabiliteter: [],
};

describe("account model", () => {
  it("normaliserer Min side-fanen og profilutkastet deterministisk", () => {
    expect(resolveAccountTab("persondata")).toBe("persondata");
    expect(resolveAccountTab("ukjent")).toBe("profil");
    expect(createDisplayNameDraft(user)).toEqual({ mode: "navn", value: "Ada" });
    expect(createDisplayNameDraft({ ...user, visningsnavn: user.epost })).toEqual({
      mode: "epost",
      value: "",
    });
    expect(resolveDisplayName(user, "epost", "Ignoreres")).toBe(user.epost);
    expect(resolveDisplayName(user, "navn", "  Ada Lovelace  ")).toBe("Ada Lovelace");
  });

  it("validerer visningsnavn med den observerte klientkontrakten", () => {
    expect(validateDisplayName(" ")).toBe("Visningsnavn kan ikke være tomt.");
    expect(validateDisplayName("Ad")).toBe("Visningsnavn må være minst 3 tegn.");
    expect(validateDisplayName("Ada!")).toBe("Visningsnavn inneholder ugyldige tegn.");
    expect(validateDisplayName("Ada Lovelace")).toBeNull();
  });
});
