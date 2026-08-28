import { describe, expect, it } from "vitest";
import { Kapabiliteter } from "$lib/domain";
import {
  bookingSettings,
  createActivity,
  createBookingStatus,
  createCourt,
  createSlot,
} from "./booking-test-data";
import {
  addDaysToIsoDate,
  countAvailableBookingSlots,
  countPassedBookingSlots,
  getBookingDayChoice,
  getBookingLimitCopy,
  getBookingLimitFacts,
  getBookingSlotPresentation,
  getVisibleBookingSlots,
  markSlotAsAvailable,
  markSlotAsOwnBooking,
  resolveBookingSelection,
} from "./model";

describe("booking selection", () => {
  it("velger første aktive gren med bane og første bane i grenen", () => {
    const emptyActivity = createActivity({ id: "empty", navn: "Badminton" });
    const tennis = createActivity({ id: "tennis" });
    const padel = createActivity({ id: "padel", navn: "Padel" });
    const tennisCourt = createCourt({ id: "tennis-1", grenId: "tennis" });
    const padelCourt = createCourt({ id: "padel-1", grenId: "padel" });

    expect(
      resolveBookingSelection([emptyActivity, tennis, padel], [tennisCourt, padelCourt], null, null)
    ).toEqual({ activityId: "tennis", courtId: "tennis-1", courts: [tennisCourt] });
  });

  it("beholder bare gyldige manuelle valg", () => {
    const tennis = createActivity({ id: "tennis" });
    const court = createCourt({ id: "court-1", grenId: "tennis" });

    expect(resolveBookingSelection([tennis], [court], "missing", "missing")).toEqual({
      activityId: "tennis",
      courtId: "court-1",
      courts: [court],
    });
  });
});

describe("booking slot presentation", () => {
  it("bevarer fysisk status anonymt og viser bare backendstyrte handlinger innlogget", () => {
    const available = createSlot({
      erEier: true,
      kapabiliteter: [Kapabiliteter.booking.book],
    });

    expect(getBookingSlotPresentation(available, false)).toMatchObject({
      canBook: false,
      status: { label: "Ledig", tone: "available" },
      title: undefined,
    });
    expect(getBookingSlotPresentation({ ...available, erEier: false }, true)).toMatchObject({
      canBook: true,
      status: { label: "Ledig", tone: "available" },
      title: undefined,
    });
  });

  it("utleder arrangementdetaljer, faktisk tid og kapabiliteter", () => {
    const presentation = getBookingSlotPresentation(
      createSlot({
        arrangementTittel: "Klubbmesterskap",
        arrangementBeskrivelse: "Finale",
        bookingStartTid: "10:00:00",
        bookingSluttTid: "12:00:00",
        kapabiliteter: [Kapabiliteter.booking.kobleTilArrangement, Kapabiliteter.booking.fjern],
      }),
      true
    );

    expect(presentation).toMatchObject({
      canCancel: true,
      canConnectToArrangement: true,
      category: { label: "Arrangement", tone: "event" },
      end: "12:00",
      hasDetails: true,
      start: "10:00",
      status: { label: "Opptatt", tone: "busy" },
      title: "Klubbmesterskap",
    });
  });

  it("viser ikke passerte, ledige tider som booket", () => {
    expect(getBookingSlotPresentation(createSlot({ erPassert: true }), true)).toMatchObject({
      status: { label: "Passert", tone: "past" },
      title: undefined,
    });

    expect(
      getBookingSlotPresentation(
        createSlot({ bookingId: "booking-1", booketAv: "spiller@example.no", erPassert: true }),
        true
      )
    ).toMatchObject({
      status: { label: "Passert", tone: "past" },
      title: "spiller@example.no",
    });
  });

  it("grupperer fler-slotsbookinger og filtrerer passerte tider bare i dag", () => {
    const slots = [
      createSlot({ bookingId: "booking-1", erPassert: true }),
      createSlot({ bookingId: "booking-1", slotStartTid: "11:00", erPassert: true }),
      createSlot({ slotStartTid: "12:00", slotSluttTid: "13:00" }),
    ];

    expect(countPassedBookingSlots(slots)).toBe(1);
    expect(getVisibleBookingSlots(slots, "2026-08-23", "2026-08-23", false)).toHaveLength(1);
    expect(getVisibleBookingSlots(slots, "2026-08-23", "2026-08-23", true)).toHaveLength(2);
    expect(countAvailableBookingSlots(slots, false)).toBe(1);
  });
});

describe("booking limits and optimistic state", () => {
  it("presenterer Gren-kvoter, personlig status og banens effektive tider", () => {
    expect(getBookingLimitFacts(bookingSettings, null, "2026-09-06").quotas).toEqual([
      {
        label: "Per dag",
        value: "Maks 2 bookinger",
      },
      {
        label: "Kommende",
        value: "Maks 5 bookinger",
      },
    ]);
    expect(
      getBookingLimitFacts(bookingSettings, createBookingStatus(), "2026-09-06").quotas
    ).toEqual([
      { label: "Valgt dag", value: "1 av 2 brukt · 1 igjen" },
      { label: "Kommende", value: "3 av 5 brukt · 2 igjen" },
    ]);
    expect(getBookingLimitFacts(bookingSettings, null, "2026-09-06").times).toEqual([
      { label: "Åpningstid", value: "08:00–22:00" },
      { label: "Lengde per tid", value: "60 minutter" },
      { label: "Kan bookes til", value: "06.09.2026" },
    ]);
    expect(getBookingLimitCopy(createActivity(), createCourt())).toEqual({
      exemptExplanation: "Du har administratortilgang og er ikke begrenset av disse kvotene.",
      quotaDescription: "Alle dine ordinære bookinger i tennis teller, også på andre baner.",
      quotaExplanation:
        "Passerte bookinger teller fortsatt på valgt dag. En kommende booking frigjør plass etter sluttiden.",
      timeDescription: "Bane 1 kan ha andre tider og en annen bookinghorisont enn øvrige baner.",
      timeExplanation: "Siste booking må være ferdig kl. 22:00.",
    });
  });

  it("markerer booking og avbestilling uten å endre andre slots", () => {
    const available = createSlot({ kapabiliteter: [Kapabiliteter.booking.book] });
    const other = createSlot({ slotStartTid: "11:00", slotSluttTid: "12:00" });
    const booked = markSlotAsOwnBooking([available, other], {
      baneId: "court-1",
      dato: "2026-08-23",
      startTid: "10:00",
      sluttTid: "11:00",
    });

    expect(booked[0]).toMatchObject({
      booketAv: "Du",
      erEier: true,
      kapabiliteter: [Kapabiliteter.booking.fjern],
    });
    expect(booked[1]).toBe(other);
    expect(
      markSlotAsAvailable([{ ...booked[0]!, bookingId: "booking-1" }], "booking-1")[0]
    ).toMatchObject({
      bookingId: null,
      booketAv: null,
      erEier: false,
      kapabiliteter: [Kapabiliteter.booking.book],
    });
  });

  it("håndterer lokale datogrenser uten UTC-skift", () => {
    expect(addDaysToIsoDate("2026-12-31", 1)).toBe("2027-01-01");
    expect(getBookingDayChoice("2026-08-23", "2026-08-23", "2026-08-24")).toBe("today");
    expect(getBookingDayChoice("2026-09-01", "2026-08-23", "2026-08-24")).toBe("date");
  });
});
