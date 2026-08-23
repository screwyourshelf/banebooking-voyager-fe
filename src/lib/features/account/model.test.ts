import { describe, expect, it } from "vitest";
import type { BrukerRespons, MinBookingRespons } from "$lib/contracts";
import {
  createDisplayNameDraft,
  filterBookingsByActivity,
  getBookingActivityOptions,
  groupBookingsByDate,
  resolveAccountTab,
  resolveDisplayName,
  sortBookingsByRelevance,
  validateDisplayName,
} from "./model";

const user: BrukerRespons = {
  id: "user-1",
  epost: "ada@example.no",
  visningsnavn: "Ada",
  roller: ["Medlem"],
  kapabiliteter: [],
};

function booking(overrides: Partial<MinBookingRespons> = {}): MinBookingRespons {
  return {
    bookingId: "booking-1",
    grenId: "tennis",
    grenNavn: "Tennis",
    baneId: "court-1",
    baneNavn: "Bane 1",
    dato: "2026-08-25",
    startTid: "10:00",
    sluttTid: "11:00",
    erPassert: false,
    kapabiliteter: [],
    ...overrides,
  };
}

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

  it("sorterer kommende først, historikk nyest først og grupperer etter dato", () => {
    const bookings = [
      booking({ bookingId: "past-old", dato: "2026-08-20", erPassert: true }),
      booking({ bookingId: "future-late", dato: "2026-08-27" }),
      booking({ bookingId: "past-new", dato: "2026-08-22", erPassert: true }),
      booking({ bookingId: "future-early", dato: "2026-08-25" }),
    ];
    const sorted = sortBookingsByRelevance(bookings);
    expect(sorted.map(({ bookingId }) => bookingId)).toEqual([
      "future-early",
      "future-late",
      "past-new",
      "past-old",
    ]);
    expect(groupBookingsByDate(sorted).map(({ date }) => date)).toEqual([
      "2026-08-25",
      "2026-08-27",
      "2026-08-22",
      "2026-08-20",
    ]);
  });

  it("lager alfabetiske grenvalg og filtrerer uten å endre kildelisten", () => {
    const bookings = [
      booking({ bookingId: "padel", grenId: "padel", grenNavn: "Padel" }),
      booking({ bookingId: "tennis" }),
      booking({ bookingId: "tennis-2" }),
    ];
    expect(getBookingActivityOptions(bookings)).toEqual([
      { value: "padel", label: "Padel" },
      { value: "tennis", label: "Tennis" },
    ]);
    expect(
      filterBookingsByActivity(bookings, ["tennis"]).map(({ bookingId }) => bookingId)
    ).toEqual(["tennis", "tennis-2"]);
    expect(bookings).toHaveLength(3);
  });
});
