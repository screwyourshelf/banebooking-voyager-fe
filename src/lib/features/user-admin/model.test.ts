import { describe, expect, it } from "vitest";
import type { BrukerRespons } from "$lib/contracts";
import {
  createUserBlockDraft,
  createUserFilters,
  filterAndSortUsers,
  getUserDisplayName,
  isDeletedUser,
  toUserBlockRequest,
  toUserUpdateRequest,
  userToEditDraft,
  validateUserBlockDraft,
  validateUserEditDraft,
} from "./model";

function user(overrides: Partial<BrukerRespons>): BrukerRespons {
  return {
    id: "user-1",
    epost: "ola@example.no",
    visningsnavn: "Ola",
    roller: ["Medlem"],
    kapabiliteter: [],
    ...overrides,
  };
}

describe("user admin model", () => {
  it("filtrerer slettede, rolle, medlemskap og søk før stabil lokal sortering", () => {
    const users = [
      user({ id: "2", visningsnavn: "Åse", opprettetTid: "2026-02-01T00:00:00Z" }),
      user({
        id: "1",
        visningsnavn: "Ada",
        roller: ["KlubbAdmin"],
        medlemskapBekreftetDato: "2026-01-01T00:00:00Z",
        opprettetTid: "2026-01-01T00:00:00Z",
      }),
      user({ id: "3", epost: "slettet_dead@epost.no", visningsnavn: "" }),
    ];

    expect(filterAndSortUsers(users, createUserFilters()).map((candidate) => candidate.id)).toEqual(
      ["2", "1"]
    );
    expect(
      filterAndSortUsers(users, {
        memberships: ["confirmed"],
        query: "ada",
        roles: ["KlubbAdmin"],
        showDeleted: true,
        sort: "name",
      }).map((candidate) => candidate.id)
    ).toEqual(["1"]);
  });

  it("identifiserer slettede brukere og velger tydeligste visningsnavn", () => {
    expect(isDeletedUser(user({ epost: "SLETTET_123@epost.no" }))).toBe(true);
    expect(getUserDisplayName(user({ visningsnavn: "", fulltNavn: "Ola Nordmann" }))).toBe(
      "Ola Nordmann"
    );
  });

  it("validerer og mapper rolle- og navneutkast til backendkontrakten", () => {
    const draft = userToEditDraft(user({ visningsnavn: " Ola ", roller: ["Utvidet"] }));
    expect(validateUserEditDraft({ ...draft, displayName: "X" }).displayName).toMatch(/minst 2/);
    expect(toUserUpdateRequest(draft)).toEqual({ rolle: "Utvidet", visningsnavn: "Ola" });
  });

  it("validerer sperreårsak og konverterer lokal ISO-dato deterministisk", () => {
    expect(createUserBlockDraft()).toEqual({ expiresOn: "", reason: "" });
    expect(validateUserBlockDraft({ expiresOn: "", reason: "x" }).reason).toMatch(/minst 3/);
    expect(toUserBlockRequest({ expiresOn: "2026-09-01", reason: "  Brudd på reglene  " })).toEqual(
      {
        type: "ManuellSperre",
        årsak: "Brudd på reglene",
        aktivTil: "2026-09-01T00:00:00.000Z",
      }
    );
  });
});
