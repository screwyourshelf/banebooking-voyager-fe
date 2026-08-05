import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { BookingBootstrapRespons } from "@/types";
import { hydrerBookingBootstrapCache } from "./bookingBootstrapCache";
import { bookingQueryKeys } from "./bookingQueryKeys";

const bookingInnstillinger = {
  aapningstid: "08:00",
  stengetid: "22:00",
  maksPerDag: 2,
  maksTotalt: 5,
  dagerFremITid: 14,
  slotLengdeMinutter: 60,
};

function lagBootstrap(): BookingBootstrapRespons {
  return {
    klubb: {
      slug: "aas",
      navn: "Ås tennisklubb",
      feedSynligAntallDager: 7,
    },
    bruker: {
      id: "bruker-1",
      epost: "medlem@example.com",
      visningsnavn: "Medlem",
      roller: ["Medlem"],
      kapabiliteter: [],
    },
    grener: [
      {
        id: "gren-1",
        navn: "Tennis",
        slug: "tennis",
        banereglement: "",
        sortering: 1,
        aktiv: true,
        bookingInnstillinger,
        kapabiliteter: [],
      },
    ],
    baner: [
      {
        id: "bane-1",
        navn: "Bane 1",
        beskrivelse: "",
        aktiv: true,
        sortering: 1,
        grenId: "gren-1",
        grenNavn: "Tennis",
        kapabiliteter: [],
        bookingInnstillinger,
        harOverstyring: false,
        bookingOverstyring: null,
      },
    ],
    valgtGrenId: "gren-1",
    valgtBaneId: "bane-1",
    dato: "2026-08-05",
    kalenderSlots: [
      {
        bookingId: null,
        baneId: "bane-1",
        baneNavn: "Bane 1",
        dato: "2026-08-05",
        slotStartTid: "08:00",
        slotSluttTid: "09:00",
        bookingStartTid: null,
        bookingSluttTid: null,
        booketAv: null,
        erPassert: false,
        kapabiliteter: [],
      },
    ],
  };
}

describe("hydrerBookingBootstrapCache", () => {
  it("fyller de eksisterende query-nøklene som bookingvisningen leser", () => {
    const queryClient = new QueryClient();
    const bootstrap = lagBootstrap();

    hydrerBookingBootstrapCache(queryClient, "aas", bootstrap);

    expect(queryClient.getQueryData(["klubb", "aas"])).toBe(bootstrap.klubb);
    expect(queryClient.getQueryData(["bruker", "aas"])).toBe(bootstrap.bruker);
    expect(queryClient.getQueryData(["grener", "aas", false])).toBe(bootstrap.grener);
    expect(queryClient.getQueryData(["baner", "aas", false])).toBe(bootstrap.baner);
    expect(queryClient.getQueryData(bookingQueryKeys.slots("aas", "bane-1", "2026-08-05"))).toBe(
      bootstrap.kalenderSlots
    );
  });

  it("legger ikke en anonym profil i cache som kan bli gjenbrukt etter innlogging", () => {
    const queryClient = new QueryClient();
    const bootstrap = { ...lagBootstrap(), bruker: null };

    hydrerBookingBootstrapCache(queryClient, "aas", bootstrap);

    expect(queryClient.getQueryData(["bruker", "aas"])).toBeUndefined();
  });
});
