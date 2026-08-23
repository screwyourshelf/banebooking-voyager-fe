import { describe, expect, it } from "vitest";
import {
  confirmationProgress,
  createAnnouncementDraft,
  nextLocalIsoDate,
  toCreateAnnouncementRequest,
  validateAnnouncementDraft,
} from "./model";

const referenceDate = new Date(2026, 7, 23, 12);

describe("announcement admin model", () => {
  it("oppretter et tomt utkast og validerer alle tre backendfeltene", () => {
    const draft = createAnnouncementDraft();
    expect(validateAnnouncementDraft(draft, referenceDate)).toEqual({
      title: "Skriv inn en tittel.",
      content: "Skriv inn kunngjøringen.",
      expiresOn: "Velg en utløpsdato fra og med i morgen.",
    });
    expect(toCreateAnnouncementRequest(draft, referenceDate)).toBeNull();
  });

  it("normaliserer tittel, editor-JSON og lokal dato til den typed requesten", () => {
    const content = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Les dette" }] }],
    });
    expect(
      toCreateAnnouncementRequest(
        { title: " Viktig beskjed ", content: ` ${content} `, expiresOn: "2026-08-24" },
        referenceDate
      )
    ).toEqual({
      tittel: "Viktig beskjed",
      tekst: content,
      utløperTidspunkt: "2026-08-24T00:00:00.000Z",
    });
  });

  it("avviser dagens dato og beskriver bekreftelsesfremdrift deterministisk", () => {
    expect(nextLocalIsoDate(referenceDate)).toBe("2026-08-24");
    expect(
      validateAnnouncementDraft(
        { title: "Tittel", content: "Innhold", expiresOn: "2026-08-23" },
        referenceDate
      ).expiresOn
    ).toMatch("i morgen");
    expect(confirmationProgress(0, 0)).toBe("Ingen brukere i målgruppen");
    expect(confirmationProgress(3, 8)).toBe("3 av 8 bekreftet");
  });
});
