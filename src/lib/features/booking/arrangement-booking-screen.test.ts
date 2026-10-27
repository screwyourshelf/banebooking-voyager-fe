// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import type { QueryClient } from "@tanstack/svelte-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AktivtArrangementRespons,
  ArrangementBookingRespons,
  BatchLeggTilArrangementBookingerRespons,
  KalenderRespons,
  KalenderSlotRespons,
} from "#lib/contracts/index.ts";
import { Kapabiliteter } from "#lib/domain/index.ts";
import { ApiError, type ApiClient } from "#lib/platform/api/index.ts";
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
const activeArrangement: AktivtArrangementRespons = {
  id: "arrangement-1",
  tittel: "Trening juniorer",
  beskrivelse: "For alle juniorer",
  kategori: "Trening",
};

function booking(slot = first()): ArrangementBookingRespons {
  return {
    bookingId: `booking-${slot.slotStartTid}`,
    baneId: slot.baneId,
    baneNavn: slot.baneNavn,
    dato: slot.dato,
    startTid: slot.slotStartTid,
    sluttTid: slot.slotSluttTid,
  };
}

function conflict(slot = second()) {
  return {
    baneId: slot.baneId,
    dato: slot.dato,
    startTid: slot.slotStartTid,
    sluttTid: slot.slotSluttTid,
    feilmelding: "Allerede booket",
  };
}

function setup({
  slots = [first(), second()],
  loadCalendar,
  loadArrangements = async () => [activeArrangement],
  connect = async () => ({ opprettet: [booking(first()), booking(second())], feilet: [] }),
}: {
  slots?: KalenderSlotRespons[];
  loadCalendar?: () => Promise<KalenderRespons>;
  loadArrangements?: () => Promise<AktivtArrangementRespons[]>;
  connect?: () => Promise<BatchLeggTilArrangementBookingerRespons>;
} = {}) {
  const bootstrap = createBootstrap({
    baner: [createCourt(), createCourt({ id: "court-2", navn: "Bane 2" })],
    kalender: { slots },
  });
  const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
    if (path.includes("booking-bootstrap")) return bootstrap;
    if (path.includes("/kalender?")) return loadCalendar ? loadCalendar() : bootstrap.kalender;
    if (path.includes("/arrangement/aktive?")) return loadArrangements();
    if (path.endsWith("/arrangement/arrangement-1/bookinger/batch") && options?.method === "POST")
      return connect();
    throw new Error(`Uventet kall: ${path}`);
  });
  let queryClient!: QueryClient;
  render(BookingScreenFixture, {
    onQueryClient: (client) => (queryClient = client),
    authenticated: true,
    request: request as ApiClient["request"],
  });
  return { request, queryClient };
}

async function openDialog() {
  await fireEvent.click((await screen.findAllByRole("button", { name: /Ledig/ }))[0]);
  await fireEvent.click(screen.getByRole("button", { name: "Koble til arrangement" }));
  return screen.getByRole("dialog", { name: "Koble til arrangement" });
}

async function chooseArrangement(dialog: HTMLElement) {
  await fireEvent.click(await within(dialog).findByRole("radio", { name: /Trening juniorer/ }));
}

describe("kobling av flere banetider til eksisterende arrangement", () => {
  it("forhåndsvelger klikket tid og sender ett samlet batchkall med valgte tider", async () => {
    const { request } = setup();
    const dialog = await openDialog();
    expect(dialog).toHaveTextContent("Bane 1");
    const times = within(dialog).getByRole("group", { name: "Banetider" });
    expect(within(times).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(times).getByRole("button", { name: "12:00–13:00" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeDisabled();
    await chooseArrangement(dialog);
    await fireEvent.click(within(times).getByRole("button", { name: "12:00–13:00" }));
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Koble 2 tider til arrangement" })
    );

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/arrangement/arrangement-1/bookinger/batch",
        {
          auth: "required",
          method: "POST",
          json: {
            bookinger: [
              { baneId: "court-1", dato: "2026-08-23", startTid: "10:00", sluttTid: "11:00" },
              { baneId: "court-1", dato: "2026-08-23", startTid: "12:00", sluttTid: "13:00" },
            ],
          },
        }
      )
    );
    expect(await within(dialog).findByText("2 tider er koblet til arrangementet")).toBeVisible();
    expect(within(dialog).queryByRole("button", { name: /^Koble \d/ })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^Lukk$/ })).toBeEnabled();
    expect(request.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  });

  it("viser bare tilgjengelige tider med arrangementkapabilitet på samme bane og dato", async () => {
    setup({
      slots: [
        first(),
        second(),
        createSlot({
          baneId: "court-2",
          slotStartTid: "14:00",
          slotSluttTid: "15:00",
          kapabiliteter: capabilities,
        }),
        createSlot({
          dato: "2026-08-24",
          slotStartTid: "15:00",
          slotSluttTid: "16:00",
          kapabiliteter: capabilities,
        }),
        createSlot({
          bookingId: "occupied",
          slotStartTid: "16:00",
          slotSluttTid: "17:00",
          kapabiliteter: capabilities,
        }),
        createSlot({
          erPassert: true,
          slotStartTid: "17:00",
          slotSluttTid: "18:00",
          kapabiliteter: capabilities,
        }),
        createSlot({
          slotStartTid: "18:00",
          slotSluttTid: "19:00",
          kapabiliteter: [Kapabiliteter.booking.book],
        }),
      ],
    });
    const dialog = await openDialog();
    const times = within(dialog).getByRole("group", { name: "Banetider" });
    expect(
      within(times)
        .getAllByRole("button")
        .map((button) => button.textContent?.trim())
    ).toEqual(["10:00–11:00", "12:00–13:00"]);
  });

  it("beholder valgt arrangement og tider ved HTTP-feil slik at handlingen kan prøves igjen", async () => {
    setup({
      connect: async () => {
        throw new ApiError("Ingen tilgang", 403);
      },
    });
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(within(dialog).getByRole("button", { name: "12:00–13:00" }));
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Koble 2 tider til arrangement" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Tidene kunne ikke kobles til arrangementet"
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Ingen tilgang");
    expect(within(dialog).getByRole("radio", { name: /Trening juniorer/ })).toBeChecked();
    expect(within(dialog).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(dialog).getByRole("button", { name: "12:00–13:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      within(dialog).getByRole("button", { name: "Koble 2 tider til arrangement" })
    ).toBeEnabled();
  });

  it("beholder valgene når ingen tider ble koblet og viser årsaken fra backend", async () => {
    setup({ connect: async () => ({ opprettet: [], feilet: [conflict(first())] }) });
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Tidene ble ikke koblet til arrangementet"
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent("10:00–11:00: Allerede booket");
    expect(within(dialog).getByRole("radio", { name: /Trening juniorer/ })).toBeChecked();
    expect(within(dialog).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeEnabled();
  });

  it("viser delvis resultat uten å kunne sende de vellykkede tidene på nytt", async () => {
    const { request } = setup({
      connect: async () => ({ opprettet: [booking()], feilet: [conflict()] }),
    });
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(within(dialog).getByRole("button", { name: "12:00–13:00" }));
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Koble 2 tider til arrangement" })
    );

    expect(
      await within(dialog).findByText("1 av 2 tider er koblet til arrangementet")
    ).toBeVisible();
    expect(within(dialog).getByRole("status")).toHaveTextContent("12:00–13:00: Allerede booket");
    expect(within(dialog).queryByRole("button", { name: /^Koble \d/ })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^Lukk$/ })).toBeEnabled();
    expect(request.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(1);
  });

  it("låser valg og lukking mens batchkoblingen lagres", async () => {
    const pending = Promise.withResolvers<BatchLeggTilArrangementBookingerRespons>();
    setup({ connect: () => pending.promise });
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    );

    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Lukk dialog" })).toBeDisabled()
    );
    expect(within(dialog).getByRole("button", { name: "Avbryt" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "10:00–11:00" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "12:00–13:00" })).toBeDisabled();
    expect(within(dialog).getByRole("radio", { name: /Trening juniorer/ })).toBeDisabled();
    await fireEvent.keyDown(dialog, { key: "Escape" });
    expect(dialog).toBeVisible();

    pending.resolve({ opprettet: [booking()], feilet: [] });
    expect(await within(dialog).findByText("1 tid er koblet til arrangementet")).toBeVisible();
  });

  it("beholder en valgt tid som blir opptatt synlig og lar den fjernes før innsending", async () => {
    let current = { slots: [first(), second()], bookingstatus: null };
    const { request, queryClient } = setup({ loadCalendar: async () => current });
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(within(dialog).getByRole("button", { name: "12:00–13:00" }));
    current = {
      slots: [first(), { ...second(), bookingId: "occupied", kapabiliteter: [] }],
      bookingstatus: null,
    };
    await queryClient.invalidateQueries();

    const unavailable = await within(dialog).findByRole("button", {
      name: "12:00–13:00 · utilgjengelig",
    });
    expect(unavailable).toHaveAttribute("aria-pressed", "true");
    expect(
      within(dialog).getByText(
        "En valgt tid er ikke lenger tilgjengelig. Fjern den og velg en annen tid."
      )
    ).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Koble 2 tider til arrangement" })
    ).toBeDisabled();
    await fireEvent.click(unavailable);
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeEnabled();
    expect(within(dialog).getByRole("radio", { name: /Trening juniorer/ })).toBeChecked();
    expect(request.mock.calls.some(([, options]) => options?.method === "POST")).toBe(false);
  });

  it("krever minst én tid før kobling", async () => {
    const { request } = setup();
    const dialog = await openDialog();
    await chooseArrangement(dialog);
    await fireEvent.click(within(dialog).getByRole("button", { name: "10:00–11:00" }));
    expect(
      within(dialog).getByRole("button", { name: "Koble 0 tider til arrangement" })
    ).toBeDisabled();
    expect(request.mock.calls.some(([, options]) => options?.method === "POST")).toBe(false);
  });

  it("viser tom arrangementsliste og tillater ikke kobling", async () => {
    setup({ loadArrangements: async () => [] });
    const dialog = await openDialog();
    expect(await within(dialog).findByText("Ingen aktive arrangementer")).toBeVisible();
    expect(within(dialog).queryByRole("radio")).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeDisabled();
  });

  it("lar arrangementslisten lastes på nytt uten at forhåndsvalgt tid forsvinner", async () => {
    const loadArrangements = vi
      .fn<() => Promise<AktivtArrangementRespons[]>>()
      .mockRejectedValueOnce(new ApiError("Midlertidig utilgjengelig", 500))
      .mockResolvedValue([activeArrangement]);
    setup({ loadArrangements });
    const dialog = await openDialog();
    expect(await within(dialog).findByText("Kunne ikke laste arrangementene")).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeDisabled();
    await fireEvent.click(within(dialog).getByRole("button", { name: "Prøv igjen" }));
    await chooseArrangement(dialog);
    expect(within(dialog).getByRole("button", { name: "10:00–11:00" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      within(dialog).getByRole("button", { name: "Koble 1 tid til arrangement" })
    ).toBeEnabled();
    expect(loadArrangements).toHaveBeenCalledTimes(2);
  });
});
