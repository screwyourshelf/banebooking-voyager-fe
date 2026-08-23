import { describe, expect, it } from "vitest";
import type { KlubbRespons } from "$lib/contracts";
import {
  createClubSettingsDraft,
  isClubSettingsDirty,
  toMembershipActivationRequest,
  toUpdateClubRequest,
  validateClubSettings,
  validateMembershipActivation,
} from "./model";

const club: KlubbRespons = {
  slug: "fjordvik",
  navn: "Fjordvik Tennisklubb",
  kontaktEpost: "post@fjordvik.no",
  nettside: "https://fjordvik.no",
  latitude: 59.1,
  longitude: 10.2,
  feedUrl: "https://fjordvik.no/feed",
  feedSynligAntallDager: 30,
};

describe("club settings model", () => {
  it("oppretter stabilt utkast, oppdager dirty-state og mapper trimmed request", () => {
    const draft = createClubSettingsDraft(club);
    expect(isClubSettingsDirty(draft, club)).toBe(false);

    draft.name = "  Fjordvik IL  ";
    draft.latitude = "59,25";
    draft.feedUrl = "";
    expect(isClubSettingsDirty(draft, club)).toBe(true);
    expect(toUpdateClubRequest(draft, club)).toEqual({
      navn: "Fjordvik IL",
      kontaktEpost: "post@fjordvik.no",
      nettside: "https://fjordvik.no",
      latitude: 59.25,
      longitude: 10.2,
      feedUrl: undefined,
      feedSynligAntallDager: 30,
    });
  });

  it("validerer klubbnavn, e-post, koordinater og feedperiode", () => {
    const errors = validateClubSettings({
      ...createClubSettingsDraft(club),
      name: " ",
      contactEmail: "ikke-epost",
      latitude: "91",
      longitude: "vest",
      feedDays: "151",
    });

    expect(errors).toMatchObject({
      name: "Klubbnavn kan ikke være tomt.",
      contactEmail: "Skriv inn en gyldig e-postadresse.",
      latitude: "Breddegrad må være mellom -90 og 90.",
      longitude: "Lengdegrad må være mellom -180 og 180.",
      feedDays: "Antall dager må være mellom 1 og 150.",
    });
  });
});

describe("membership activation model", () => {
  it("krever navn og lokal dato og serialiserer API-tidspunkt deterministisk", () => {
    expect(validateMembershipActivation({ label: "", expiresOn: null })).toEqual({
      label: "Skriv inn et periodenavn.",
      expiresOn: "Velg datoen perioden utløper.",
    });
    expect(
      toMembershipActivationRequest({ label: "  Sesong 2027  ", expiresOn: "2027-05-01" })
    ).toEqual({ label: "Sesong 2027", gyldigTil: "2027-05-01T00:00:00.000Z" });
  });
});
