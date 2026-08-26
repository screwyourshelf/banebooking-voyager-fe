import { describe, expect, it } from "vitest";
import { createActivity, createCourt } from "./admin-test-data";
import {
  activityToDraft,
  courtDraftIsDirty,
  courtToDraft,
  createCourtReorderUpdates,
  hasErrors,
  sortActivities,
  sortCourts,
  toActivityCreateRequest,
  toCourtBookingSettingsRequest,
  validateActivityDraft,
  validateCourtDraft,
} from "./model";

describe("court and activity drafts", () => {
  it("mapper transportdata til selvstendige utkast og oppdager reelle endringer", () => {
    const court = createCourt();
    const draft = courtToDraft(court);

    expect(courtDraftIsDirty(court, draft)).toBe(false);
    expect(courtDraftIsDirty(court, { ...draft, active: false })).toBe(true);
    expect(activityToDraft(createActivity())).toMatchObject({
      openingHour: 7,
      closingHour: 22,
      maxPerDay: 2,
      slotMinutes: 60,
    });
  });

  it("validerer navn, lengder, gren og åpningstid før mutasjon", () => {
    const courtErrors = validateCourtDraft({
      ...courtToDraft(createCourt()),
      name: " ",
      description: "x".repeat(501),
      activityId: "",
    });
    const activityErrors = validateActivityDraft({
      ...activityToDraft(createActivity()),
      openingHour: 22,
      closingHour: 7,
    });

    expect(courtErrors).toEqual({
      name: "Navn er påkrevd.",
      description: "Beskrivelse kan maks være 500 tegn.",
      activityId: "Gren er påkrevd.",
    });
    expect(activityErrors.hours).toBe("Åpningstid må være før stengetid.");
    expect(hasErrors(activityErrors)).toBe(true);
  });

  it("serialiserer nullable baneoverstyringer til API-format", () => {
    expect(
      toCourtBookingSettingsRequest({
        openingHour: 8,
        closingHour: null,
        slotMinutes: 45,
        maxPerDay: null,
        maxActive: 4,
        daysAhead: null,
      })
    ).toEqual({
      aapningstid: "08:00",
      stengetid: null,
      slotLengdeMinutter: 45,
      maksPerDag: null,
      maksTotalt: 4,
      dagerFremITid: null,
    });
  });

  it("utelater redigeringsspesifikk aktiv-state fra opprettingskontrakten", () => {
    expect(toActivityCreateRequest(activityToDraft(createActivity()))).not.toHaveProperty("aktiv");
  });
});

describe("court and activity ordering", () => {
  it("sorterer grener og baner deterministisk", () => {
    const padel = createActivity({ id: "padel", navn: "Padel", sortering: 1 });
    const tennis = createActivity({ id: "tennis", navn: "Tennis", sortering: 0 });
    const courts = [
      createCourt({ id: "second", navn: "Bane 2", sortering: 1 }),
      createCourt({ id: "first", navn: "Bane 1", sortering: 0 }),
    ];

    expect(sortActivities([padel, tennis]).map((activity) => activity.id)).toEqual([
      "tennis",
      "padel",
    ]);
    expect(sortCourts(courts).map((court) => court.id)).toEqual(["first", "second"]);
  });

  it("lager komplette typed nabooppdateringer ved reorder innenfor samme gren", () => {
    const courts = [
      createCourt({ id: "first", navn: "Bane 1", sortering: 0 }),
      createCourt({ id: "second", navn: "Bane 2", sortering: 1 }),
    ];

    expect(createCourtReorderUpdates(courts, "second", -1)).toEqual([
      {
        courtId: "second",
        request: {
          grenId: "activity-1",
          navn: "Bane 2",
          beskrivelse: "Ved klubbhuset",
          aktiv: true,
          sortering: 0,
        },
      },
      {
        courtId: "first",
        request: {
          grenId: "activity-1",
          navn: "Bane 1",
          beskrivelse: "Ved klubbhuset",
          aktiv: true,
          sortering: 1,
        },
      },
    ]);
    expect(createCourtReorderUpdates(courts, "first", -1)).toEqual([]);
  });
});
