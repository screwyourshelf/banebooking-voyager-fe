// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BookingBootstrapRespons } from "$lib/contracts";
import { Kapabiliteter } from "$lib/domain";
import { ApiError, type ApiClient } from "$lib/platform/api";
import BookingScreenFixture from "./BookingScreenFixture.test.svelte";
import { createBootstrap, createSlot } from "./booking-test-data";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-08-23T12:00:00+02:00"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function renderBooking(
  bootstrap: BookingBootstrapRespons,
  {
    activeArrangements = [],
    authenticated = false,
    postError,
  }: {
    activeArrangements?: Array<{
      id: string;
      tittel: string;
      beskrivelse?: string;
      kategori: "Trening";
    }>;
    authenticated?: boolean;
    postError?: Error;
  } = {}
) {
  const request = vi.fn(async (path: string, options?: { method?: string }) => {
    if (path.includes("booking-bootstrap")) return bootstrap;
    if (path.includes("/kalender?")) return bootstrap.kalenderSlots;
    if (path.includes("/arrangement/aktive?")) return activeArrangements;
    if (options?.method === "POST") {
      if (postError) throw postError;
      return { bookingId: "booking-1", melding: "Booket" };
    }
    if (options?.method === "DELETE") return { melding: "Avbestilt" };
    throw new Error(`Uventet kall: ${path}`);
  });
  const result = render(BookingScreenFixture, {
    authenticated,
    request: request as ApiClient["request"],
  });
  return { request, result };
}

describe("booking screen", () => {
  it("viser bootstrapdata, fysisk status, vær og regler uten anonyme handlinger", async () => {
    const bootstrap = createBootstrap({
      kalenderSlots: [
        createSlot({
          kapabiliteter: [Kapabiliteter.booking.book],
          værSymbol: "fair_day",
          temperatur: 18.4,
        }),
      ],
    });
    const { request, result } = renderBooking(bootstrap);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "Book bane" })).toBeVisible()
    );
    expect(screen.getByRole("region", { name: "1 ledig tid" })).toHaveTextContent("Bane 1");
    expect(screen.getByText("Ledig")).toBeVisible();
    expect(screen.queryByRole("button", { name: /^Book tiden/ })).not.toBeInTheDocument();
    expect(screen.getByText("18°")).toBeVisible();
    expect(request).toHaveBeenCalledWith(
      expect.stringMatching(/^klubb\/fjordvik\/booking-bootstrap\?dato=\d{4}-\d{2}-\d{2}$/),
      { auth: "optional", signal: expect.any(AbortSignal) }
    );

    await fireEvent.click(screen.getByRole("button", { name: "Bookingregler" }));
    expect(screen.getByRole("dialog", { name: "Bookingregler for Bane 1" })).toHaveTextContent(
      "Maks 2 bookinger"
    );
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("booker en kapabilitetsstyrt slot og sender eksakt request", async () => {
    const bootstrap = createBootstrap({
      bruker: {
        id: "user-1",
        epost: "ada@example.no",
        visningsnavn: "Ada",
        roller: ["Medlem"],
        kapabiliteter: [],
      },
      kalenderSlots: [
        createSlot({
          dato: createBootstrap().dato,
          kapabiliteter: [Kapabiliteter.booking.book],
        }),
      ],
    });
    const { request } = renderBooking(bootstrap, { authenticated: true });
    const bookButton = await screen.findByRole("button", { name: "Book tiden 10:00 til 11:00" });

    await fireEvent.click(bookButton);

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bookinger", {
        auth: "required",
        method: "POST",
        json: {
          baneId: "court-1",
          dato: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          startTid: "10:00",
          sluttTid: "11:00",
        },
      })
    );
  });

  it("ruller tilbake en avvist optimistisk booking og viser vedvarende inline-feil", async () => {
    const bootstrap = createBootstrap({
      kalenderSlots: [createSlot({ kapabiliteter: [Kapabiliteter.booking.book] })],
    });
    renderBooking(bootstrap, {
      authenticated: true,
      postError: new Error("Tiden ble nettopp tatt."),
    });

    await fireEvent.click(
      await screen.findByRole("button", { name: "Book tiden 10:00 til 11:00" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Tiden ble nettopp tatt.");
    expect(screen.getByRole("button", { name: "Book tiden 10:00 til 11:00" })).toBeEnabled();
  });

  it("avbestiller egen tid fra den utvidede slotraden", async () => {
    const bootstrap = createBootstrap({
      kalenderSlots: [
        createSlot({
          bookingId: "booking-1",
          bookingStartTid: "10:00",
          bookingSluttTid: "11:00",
          booketAv: "Ada",
          erEier: true,
          kapabiliteter: [Kapabiliteter.booking.fjern],
        }),
      ],
    });
    const { request } = renderBooking(bootstrap, { authenticated: true });

    await fireEvent.click(await screen.findByRole("button", { name: /Din tid/ }));
    await fireEvent.click(screen.getByRole("button", { name: "Avbestill" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bookinger/booking-1", {
        auth: "required",
        method: "DELETE",
      })
    );
  });

  it("kobler en opptatt tid til et valgt aktivt arrangement", async () => {
    const bootstrap = createBootstrap({
      kalenderSlots: [
        createSlot({
          bookingId: "booking-1",
          bookingStartTid: "10:00",
          bookingSluttTid: "11:00",
          booketAv: "Ada",
          erEier: true,
          kapabiliteter: [Kapabiliteter.booking.kobleTilArrangement],
        }),
      ],
    });
    const { request } = renderBooking(bootstrap, {
      authenticated: true,
      activeArrangements: [
        {
          id: "arrangement-1",
          tittel: "Klubbmesterskap",
          beskrivelse: "Finaledag",
          kategori: "Trening",
        },
      ],
    });

    await fireEvent.click(await screen.findByRole("button", { name: /Din tid/ }));
    await fireEvent.click(screen.getByRole("button", { name: "Koble til arrangement" }));
    await fireEvent.click(await screen.findByRole("radio", { name: /Klubbmesterskap/ }));
    await fireEvent.click(screen.getByRole("button", { name: "Koble til valgt arrangement" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bookinger", {
        auth: "required",
        method: "POST",
        json: {
          arrangementId: "arrangement-1",
          baneId: "court-1",
          dato: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          startTid: "10:00",
          sluttTid: "11:00",
        },
      })
    );
  });

  it("viser retrybar bootstrapfeil uten å falle tilbake på serverfeil", async () => {
    const request = vi.fn().mockRejectedValue(new ApiError("Backend utilgjengelig", 500));
    render(BookingScreenFixture, { request: request as ApiClient["request"] });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Kunne ikke starte bookingen" })
    ).toBeVisible();
    expect(screen.getByText("Backend utilgjengelig")).toBeVisible();
    expect(screen.getByRole("button", { name: "Prøv igjen" })).toBeEnabled();
    expect(request).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("viser eksplisitt manglende oppsett og tom slotliste", async () => {
    const { result: noSetup } = renderBooking(
      createBootstrap({
        grener: [],
        baner: [],
        valgtGrenId: null,
        valgtBaneId: null,
        kalenderSlots: [],
      })
    );
    expect(await screen.findByText("Booking er ikke satt opp")).toBeVisible();
    noSetup.unmount();

    renderBooking(createBootstrap({ kalenderSlots: [] }));
    expect(await screen.findByText("Ingen tider denne dagen")).toBeVisible();
  });
});
