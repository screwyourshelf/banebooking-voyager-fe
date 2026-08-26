import { describe, expect, it } from "vitest";
import {
  toMembershipConfirmationRequest,
  validateMembershipConfirmation,
} from "./membership-confirmation-model";

describe("membership confirmation model", () => {
  it("krever fullt navn og medlemskapstype", () => {
    expect(validateMembershipConfirmation({ fullName: "  ", membershipType: "" })).toEqual({
      fullName: "Skriv inn fullt navn.",
      membershipType: "Velg medlemskapstype.",
    });
  });

  it("normaliserer skjemautkastet til transportkontrakten", () => {
    expect(
      toMembershipConfirmationRequest({
        fullName: "  Ada Lovelace  ",
        membershipType: "StudentVernepliktig",
      })
    ).toEqual({ fulltNavn: "Ada Lovelace", medlemskapType: "StudentVernepliktig" });
  });
});
