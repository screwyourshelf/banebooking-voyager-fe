// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import type { QueryClient } from "@tanstack/svelte-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  KalenderRespons,
  KalenderSlotRespons,
  OpprettArrangementRespons,
} from "#lib/contracts/index.ts";
import { Kapabiliteter } from "#lib/domain/index.ts";
import type { ApiClient } from "#lib/platform/api/index.ts";
import BookingScreenFixture from "./BookingScreenFixture.test.svelte";
import { createBootstrap, createCourt, createSlot } from "./booking-test-data";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-08-23T09:00:00+02:00"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const capabilities = [Kapabiliteter.booking.book, Kapabiliteter.booking.kobleTilArrangement];
const first = () => createSlot({ kapabiliteter: capabilities });
const second = () =>
  createSlot({ slotStartTid: "12:00", slotSluttTid: "13:00", kapabiliteter: capabilities });

function setup({
  authenticated = true,
  slots = [first(), second()],
  loadCalendar,
  create = async () => ({ arrangementId: "new-arrangement", antallOpprettet: 2, konflikter: [] }),
}: {
  authenticated?: boolean;
  slots?: KalenderSlotRespons[];
  loadCalendar?: () => Promise<KalenderRespons>;
  create?: () => Promise<OpprettArrangementRespons>;
} = {}) {
  const bootstrap = createBootstrap({
    baner: [createCourt(), createCourt({ id: "court-2", navn: "Bane 2" })],
    kalender: { slots },
  });
  const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
    if (path.includes("booking-bootstrap")) return bootstrap;
    if (path.includes("/kalender?")) return loadCalendar ? loadCalendar() : bootstrap.kalender;
    if (path.endsWith("/arrangement") && options?.method === "POST") return create();
    throw new Error(`Uventet kall: ${path}`);
  });
  let queryClient!: QueryClient;
  const rendered = render(BookingScreenFixture, {
    onQueryClient: (client) => (queryClient = client),
    authenticated,
    request: request as ApiClient["request"],
  });
  return { request, rendered, queryClient };
}

async function openDialog() {
  await fireEvent.click((await screen.findAllByRole("button", { name: /Ledig/ }))[0]);
  expect(screen.getByRole("button", { name: "Koble til arrangement" })).toBeVisible();
  await fireEvent.click(screen.getByRole("button", { name: "Opprett nytt arrangement" }));
  return screen.getByRole("dialog", { name: "Opprett nytt arrangement" });
}

describe("hurtigoppretting i kalender", () => {
  it("oppretter med standardtype uten skriving og utelater tom valgfri beskrivelse", async () => {
    const { request } = setup({
      create: async () => ({
        arrangementId: "new-arrangement",
        antallOpprettet: 1,
        konflikter: [],
      }),
    });
    const dialog = await openDialog();
    expect(within(dialog).queryByRole("textbox", { name: "Tittel" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("combobox", { name: "Type" })).toHaveTextContent("Annet");
    expect(within(dialog).getByRole("textbox", { name: "Beskrivelse" })).toHaveValue("");
    expect(within(dialog).getByRole("textbox", { name: "Beskrivelse" })).not.toBeRequired();
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 1 tid" })
    );

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/arrangement", {
        auth: "required",
        method: "POST",
        json: expect.objectContaining({
          tittel: "Annet",
          kategori: "Annet",
          beskrivelse: undefined,
          eksplisitteSlots: [
            { baneId: "court-1", dato: "2026-08-23", startTid: "10:00", sluttTid: "11:00" },
          ],
        }),
      })
    );
    expect(await within(dialog).findByText("Arrangementet er opprettet")).toBeVisible();
  });

  it("beholder en valgt tid synlig når den først blir ledig og deretter opptatt igjen", async () => {
    let current = {
      slots: [first(), { ...second(), bookingId: "opptatt", kapabiliteter: [] }],
      bookingstatus: null,
    };
    const { queryClient } = setup({ slots: current.slots, loadCalendar: async () => current });
    const dialog = await openDialog();
    await fireEvent.input(within(dialog).getByRole("textbox", { name: "Beskrivelse" }), {
      target: { value: "For alle juniorer" },
    });
    current = { ...current, slots: [first(), second()] };
    await queryClient.invalidateQueries();
    await fireEvent.click(await within(dialog).findByRole("button", { name: "12:00–13:00" }));
    current = {
      ...current,
      slots: [first(), { ...second(), bookingId: "opptatt", kapabiliteter: [] }],
    };
    await queryClient.invalidateQueries();
    const unavailable = await within(dialog).findByRole("button", {
      name: "12:00–13:00 · utilgjengelig",
    });
    expect(unavailable).toHaveAttribute("aria-pressed", "true");
    expect(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 2 tider" })
    ).toBeDisabled();
    await fireEvent.click(unavailable);
    expect(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 1 tid" })
    ).toBeEnabled();
    expect(within(dialog).getByRole("textbox", { name: "Beskrivelse" })).toHaveValue(
      "For alle juniorer"
    );
  });

  it.each(["Bane 2", "I morgen"])(
    "låser oppretting fra gammel kalender ved valg av %s",
    async (selection) => {
      const pending = Promise.withResolvers<KalenderRespons>();
      const { request } = setup({ loadCalendar: () => pending.promise });
      await fireEvent.click((await screen.findAllByRole("button", { name: /Ledig/ }))[0]);
      const create = screen.getByRole("button", { name: "Opprett nytt arrangement" });
      await fireEvent.click(screen.getByRole("button", { name: selection }));
      await waitFor(() => expect(create).toBeDisabled());
      await fireEvent.click(create);
      expect(
        screen.queryByRole("dialog", { name: "Opprett nytt arrangement" })
      ).not.toBeInTheDocument();
      expect(request.mock.calls.some(([, options]) => options?.method)).toBe(false);
      pending.resolve({ slots: [], bookingstatus: null });
    }
  );

  it("forhåndsvelger tiden og sender flere tider gjennom eksisterende arrangements-API", async () => {
    const { request } = setup();
    const dialog = await openDialog();
    const times = within(dialog).getByRole("group", { name: "Banetider" });
    expect(within(times).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const type = within(dialog).getByRole("combobox", { name: "Type" });
    await fireEvent.keyDown(type, { key: "k" });
    await fireEvent.keyDown(type, { key: "u" });
    await waitFor(() => expect(type).toHaveTextContent("Kurs"));
    await fireEvent.input(within(dialog).getByRole("textbox", { name: "Beskrivelse" }), {
      target: { value: "For alle" },
    });
    await fireEvent.click(within(times).getByRole("button", { name: "12:00–13:00" }));
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 2 tider" })
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/arrangement", {
        auth: "required",
        method: "POST",
        json: expect.objectContaining({
          tittel: "Kurs",
          beskrivelse: "For alle",
          kategori: "Kurs",
          publisertPåNettsiden: false,
          eksplisitteSlots: [
            { baneId: "court-1", dato: "2026-08-23", startTid: "10:00", sluttTid: "11:00" },
            { baneId: "court-1", dato: "2026-08-23", startTid: "12:00", sluttTid: "13:00" },
          ],
        }),
      })
    );
    expect(await within(dialog).findByText("Arrangementet er opprettet")).toBeVisible();
    expect(
      within(dialog).queryByRole("button", { name: /^Opprett arrangement med/ })
    ).not.toBeInTheDocument();
  });

  it("beholder utkast og valgte tider ved nettverksfeil, og blokkerer lukking under lagring", async () => {
    const pending = Promise.withResolvers<OpprettArrangementRespons>();
    setup({ create: () => pending.promise });
    const dialog = await openDialog();
    const description = within(dialog).getByRole("textbox", { name: "Beskrivelse" });
    await fireEvent.input(description, { target: { value: "For alle juniorer" } });
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 1 tid" })
    );
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Lukk dialog" })).toBeDisabled()
    );
    expect(description).toBeDisabled();
    pending.reject(new Error("Backend utilgjengelig"));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Backend utilgjengelig");
    expect(description).toHaveValue("For alle juniorer");
    expect(within(dialog).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 1 tid" })
    ).toBeEnabled();
  });

  it("viser delvis resultat og lar ikke ny innsending opprette et duplikat", async () => {
    const { request } = setup({
      create: async () => ({
        arrangementId: "new-arrangement",
        antallOpprettet: 1,
        konflikter: [
          {
            baneId: "court-1",
            dato: "2026-08-23",
            startTid: "12:00",
            sluttTid: "13:00",
            feilmelding: "Allerede booket",
          },
        ],
      }),
    });
    const dialog = await openDialog();
    await fireEvent.click(within(dialog).getByRole("button", { name: "12:00–13:00" }));
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 2 tider" })
    );
    expect(await within(dialog).findByText("Arrangement opprettet med 1 av 2 tider")).toBeVisible();
    expect(within(dialog).getByRole("status")).toHaveTextContent("12:00–13:00: Allerede booket");
    expect(
      within(dialog).queryByRole("button", { name: /^Opprett arrangement med/ })
    ).not.toBeInTheDocument();
    expect(request.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  });

  it("beholder skjema ved null opprettede tider og viser backendens avvisning", async () => {
    setup({
      create: async () => ({
        arrangementId: "00000000-0000-0000-0000-000000000000",
        antallOpprettet: 0,
        konflikter: [
          {
            baneId: "00000000-0000-0000-0000-000000000000",
            dato: "0001-01-01",
            startTid: "00:00",
            sluttTid: "00:00",
            feilmelding: "Ingen tilgang",
          },
        ],
      }),
    });
    const dialog = await openDialog();
    await fireEvent.input(within(dialog).getByRole("textbox", { name: "Beskrivelse" }), {
      target: { value: "For alle juniorer" },
    });
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 1 tid" })
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Ingen tilgang");
    expect(within(dialog).getByRole("textbox", { name: "Beskrivelse" })).toHaveValue(
      "For alle juniorer"
    );
  });

  it("avviser et tomt tidsvalg uten å sende forespørsel", async () => {
    const { request } = setup();
    const dialog = await openDialog();
    await fireEvent.click(within(dialog).getByRole("button", { name: "10:00–11:00" }));
    expect(
      within(dialog).getByRole("button", { name: "Opprett arrangement med 0 tider" })
    ).toBeDisabled();
    expect(request.mock.calls.some(([, options]) => options?.method)).toBe(false);
  });

  it.each([false, true])(
    "viser bare oppretting ved innlogging og arrangementkapabilitet: %s",
    async (authenticated) => {
      setup({
        authenticated,
        slots: [createSlot({ kapabiliteter: [Kapabiliteter.booking.book] })],
      });
      await screen.findByRole("heading", { name: "Book bane" });
      expect(
        screen.queryByRole("button", { name: "Opprett nytt arrangement" })
      ).not.toBeInTheDocument();
    }
  );
});
