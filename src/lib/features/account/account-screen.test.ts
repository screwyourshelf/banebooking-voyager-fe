// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MinBookingRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import AccountFixture from "./AccountFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

const bookings: MinBookingRespons[] = [
  {
    bookingId: "booking-1",
    grenId: "tennis",
    grenNavn: "Tennis",
    baneId: "court-1",
    baneNavn: "Bane 1",
    dato: "2026-08-25",
    startTid: "10:00",
    sluttTid: "11:00",
    erPassert: false,
    kapabiliteter: ["booking:fjern"],
    temperatur: 18,
  },
  {
    bookingId: "booking-2",
    grenId: "padel",
    grenNavn: "Padel",
    baneId: "court-2",
    baneNavn: "Padelbane",
    dato: "2026-08-26",
    startTid: "12:00",
    sluttTid: "13:00",
    erPassert: false,
    kapabiliteter: [],
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

function renderAccount(props: Partial<Parameters<typeof render<typeof AccountFixture>>[1]> = {}) {
  const request = vi.fn().mockResolvedValue(undefined);
  const result = render(AccountFixture, {
    request: request as ApiClient["request"],
    ...props,
  });
  return { request, result };
}

describe("account screens", () => {
  it("viser sessioneid profil, medlemskap, fanenavigasjon og tilgjengelig anatomi", async () => {
    const { result } = renderAccount();

    expect(screen.getByRole("heading", { level: 1, name: "Min side" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Områder på Min side" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("Voksen")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("validerer og lagrer eget visningsnavn før sessionqueryen invalides", async () => {
    const onUserUpdated = vi.fn(async () => undefined);
    const { request } = renderAccount({ onUserUpdated });
    const input = screen.getByRole("textbox", { name: "Eget navn" });
    await fireEvent.input(input, { target: { value: "A" } });
    expect(screen.getByRole("alert")).toHaveTextContent("Visningsnavn må være minst 3 tegn.");
    expect(screen.getByRole("button", { name: "Lagre endringer" })).toBeDisabled();
    await fireEvent.input(input, { target: { value: "Ada Lovelace" } });
    await fireEvent.click(screen.getByRole("button", { name: "Lagre endringer" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bruker/meg", {
        auth: "required",
        method: "PATCH",
        json: { visningsnavn: "Ada Lovelace" },
      })
    );
    expect(onUserUpdated).toHaveBeenCalledTimes(1);
  });

  it("viser persondata og laster ned JSON gjennom den beskyttede eksportgrensen", async () => {
    const createObjectURL = vi.fn(() => "blob:account-data");
    const revokeObjectURL = vi.fn();
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectURL },
      revokeObjectURL: { configurable: true, value: revokeObjectURL },
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const request = vi.fn().mockResolvedValue({ bruker: { epost: "ada@example.no" } });
    const result = render(AccountFixture, {
      activeTab: "persondata",
      request: request as ApiClient["request"],
    });

    expect(screen.getByRole("link", { name: "Data" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Akseptert")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Last ned data" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith("klubb/fjordvik/bruker/meg/egen-data", {
        auth: "required",
      })
    );
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:account-data");
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("holder slett-meg-dialogen åpen og låst mens slettingen pågår, så logger den ut", async () => {
    let resolveDelete!: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    const request = vi.fn((_path: string, options?: { method?: string }) =>
      options?.method === "DELETE" ? deletePromise : Promise.resolve(undefined)
    );
    const onSignOut = vi.fn(async () => undefined);
    render(AccountFixture, {
      onSignOut,
      request: request as ApiClient["request"],
    });
    const trigger = screen.getByRole("button", { name: "Slett kontoen min" });

    trigger.focus();
    await fireEvent.click(trigger);
    let dialog = screen.getByRole("dialog", { name: "Slett kontoen?" });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Avbryt" }));
    await waitFor(() => expect(trigger).toHaveFocus());

    await fireEvent.click(trigger);
    dialog = screen.getByRole("dialog", { name: "Slett kontoen?" });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Slett konto" }));

    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Sletter …" })).toBeDisabled()
    );
    expect(within(dialog).getByRole("button", { name: "Avbryt" })).toBeDisabled();
    resolveDelete();
    await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("dialog", { name: "Slett kontoen?" })).not.toBeInTheDocument();
  });

  it("viser, filtrerer og avbestiller Mine tider med vedvarende rollback-feil", async () => {
    const request = vi.fn(async (path: string, options?: { method?: string }) => {
      if (path.includes("bookinger/mine")) return bookings;
      if (options?.method === "DELETE") throw new Error("Tiden kan ikke avbestilles.");
      throw new Error(`Uventet kall: ${path}`);
    });
    const result = render(AccountFixture, {
      mode: "bookings",
      request: request as ApiClient["request"],
    });

    expect(await screen.findByRole("heading", { level: 1, name: "Mine bookinger" })).toBeVisible();
    expect(await screen.findByText("Bane 1")).toBeVisible();
    expect(screen.getByText("Padelbane")).toBeVisible();
    await fireEvent.click(screen.getByRole("switch", { name: "Vis tidligere" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/bookinger/mine?inkluderHistoriske=true",
        { auth: "required", signal: expect.any(AbortSignal) }
      )
    );
    await fireEvent.click(screen.getByRole("button", { name: "Padel" }));
    expect(screen.queryByText("Bane 1")).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Tennis" }));
    expect(await screen.findByText("Bane 1")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: /Bane 1/ }));
    await fireEvent.click(screen.getByRole("button", { name: "Avbestill" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Tiden kan ikke avbestilles.");
    expect(await screen.findByText("Bane 1")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("henter historikkvarianten og viser retrybar listefeil", async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error("Nettverket er nede"));
    render(AccountFixture, { mode: "bookings", request: request as ApiClient["request"] });

    expect(await screen.findByText("Kunne ikke laste bookingene dine")).toBeVisible();
    expect(screen.getByRole("button", { name: "Prøv igjen" })).toBeEnabled();
  });

  it("reserverer listegeometri under loading og viser kommende tomtilstand", async () => {
    let resolveBookings!: (value: MinBookingRespons[]) => void;
    const pending = new Promise<MinBookingRespons[]>((resolve) => {
      resolveBookings = resolve;
    });
    const request = vi.fn(() => pending);
    render(AccountFixture, {
      mode: "bookings",
      request: request as unknown as ApiClient["request"],
    });

    expect(await screen.findByRole("status", { name: "Laster bookinger" })).toBeVisible();
    resolveBookings([]);
    expect(await screen.findByText("Ingen kommende bookinger")).toBeVisible();
    expect(screen.getByRole("link", { name: "Book en bane" })).toHaveAttribute("href", "/fjordvik");
  });
});
