// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import AdminFixture from "./AdminFixture.test.svelte";
import { activity, arrangement, arrangementBooking, court } from "./admin-test-data";

afterEach(async () => {
  cleanup();
  // La dialogens utsatte scroll-opplåsing fullføre før jsdom rives ned.
  await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
});

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

function createRequest() {
  return vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
    if (path.split("?")[0].endsWith("arrangementer")) return [arrangement];
    if (path.endsWith("grener")) return [activity];
    if (path.endsWith("baner")) return [court];
    if (path.endsWith("bookinger") && !options?.method) return [arrangementBooking];
    if (path.endsWith("forhandsvis")) {
      const request = options?.json as { eksplisitteSlots?: Array<Record<string, string>> };
      return {
        konflikter: [],
        ledige: (request.eksplisitteSlots ?? []).map((slot) => ({
          baneId: slot.baneId,
          baneNavn: court.navn,
          dato: slot.dato,
          sluttTid: slot.sluttTid,
          startTid: slot.startTid,
        })),
      };
    }
    if (path.endsWith("arrangement") && options?.method === "POST") {
      return { arrangementId: "event-2", antallOpprettet: 1, konflikter: [] };
    }
    if (path.endsWith("metadata") && options?.method === "PATCH") {
      return { arrangementId: arrangement.id, ...(options.json as Record<string, unknown>) };
    }
    return undefined;
  });
}

describe("arrangement administration", () => {
  it("henter historikken og viser tidligere arrangementer bare når bryteren er på", async () => {
    const fallback = createRequest();
    const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
      if (path.split("?")[0].endsWith("arrangementer")) {
        return new URL(path, "https://example.test").searchParams.get("inkluderHistoriske") ===
          "true"
          ? [{ ...arrangement, erPassert: true, tittel: "Tidligere sommercup" }]
          : [];
      }
      return fallback(path, options);
    });
    render(AdminFixture, { request: request as ApiClient["request"] });
    await screen.findByText("Ingen aktive arrangementer");
    const toggle = screen.getByRole("switch", { name: "Vis tidligere" });
    expect(screen.queryByText("Tidligere sommercup")).toBeNull();
    await fireEvent.click(toggle);
    expect(await screen.findByText("Tidligere sommercup")).toBeVisible();
    await fireEvent.click(toggle);
    expect(screen.queryByText("Tidligere sommercup")).toBeNull();
  });

  it("viser kapabilitetsstyrt oversikt, editorsteg og har ingen oppdagede a11y-brudd", async () => {
    const request = createRequest();
    const result = render(AdminFixture, {
      request: request as ApiClient["request"],
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Administrer arrangementer" })
    ).toBeVisible();
    expect(await screen.findByText("Høstcup")).toBeVisible();
    expect(request.mock.calls.some(([path]) => path.endsWith("baner"))).toBe(false);
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: /Rediger Høstcup/ }));
    await waitFor(() =>
      expect(request.mock.calls.some(([path]) => path.endsWith("baner"))).toBe(true)
    );
    const dialog = screen.getByRole("dialog", { name: "Høstcup" });
    expect(within(dialog).getByRole("button", { name: /Informasjon/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
    await fireEvent.click(within(dialog).getByRole("button", { name: /Tider/ }));
    expect(await within(dialog).findByText("1 banetid")).toBeVisible();
    expect(within(dialog).getByRole("button", { name: /Rediger Bane 1/ })).toBeVisible();
  });

  it.each([false, true])(
    "bekrefter siste banetid og håndterer slettesperre (avvist: %s)",
    async (avvist) => {
      const fallback = createRequest();
      let deleted = false;
      const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
        if (path.split("?")[0].endsWith("arrangementer")) return deleted ? [] : [arrangement];
        if (options?.method === "DELETE") {
          if (avvist)
            throw new Error(
              "Arrangementet kan ikke slettes fordi det har en tilknyttet turnering."
            );
          deleted = true;
          return {
            melding: "Siste booking og arrangementet er slettet",
            slettetArrangementId: arrangement.id,
          };
        }
        return fallback(path, options);
      });
      render(AdminFixture, { request: request as ApiClient["request"] });
      await fireEvent.click(await screen.findByRole("button", { name: /Rediger Høstcup/ }));
      const editor = screen.getByRole("dialog", { name: "Høstcup" });
      await fireEvent.click(within(editor).getByRole("button", { name: /Tider/ }));
      await fireEvent.click(await within(editor).findByRole("button", { name: /Rediger Bane 1/ }));
      await fireEvent.click(screen.getByRole("button", { name: "Avlys banetid" }));
      const confirmation = screen.getByRole("dialog", { name: "Avlys banetid" });
      expect(confirmation).toHaveTextContent(
        "Dette er arrangementets siste tid. Arrangementet slettes også."
      );
      expect(deleted).toBe(false);
      await fireEvent.click(within(confirmation).getByRole("button", { name: "Ja, avlys" }));
      if (avvist) {
        expect(
          await within(confirmation).findByText(
            "Arrangementet kan ikke slettes fordi det har en tilknyttet turnering."
          )
        ).toBeVisible();
        expect(confirmation).toBeVisible();
        expect(deleted).toBe(false);
      } else {
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(screen.queryByRole("button", { name: /Rediger Høstcup/ })).toBeNull();
        expect(deleted).toBe(true);
      }
    }
  );

  it.each([false, true])(
    "avlyser direkte når flere tider finnes og viser eventuell feil (avvist: %s)",
    async (avvist) => {
      const fallback = createRequest();
      let deleted = false;
      const secondBooking = {
        ...arrangementBooking,
        bookingId: "booking-2",
        startTid: "09:00",
        sluttTid: "10:00",
      };
      const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
        if (path.endsWith("bookinger") && !options?.method)
          return deleted ? [secondBooking] : [arrangementBooking, secondBooking];
        if (options?.method === "DELETE") {
          if (avvist) throw new Error("Tiden kunne ikke avlyses nå.");
          deleted = true;
          return { melding: "Bookingen er slettet" };
        }
        return fallback(path, options);
      });
      render(AdminFixture, { request: request as ApiClient["request"] });
      await fireEvent.click(await screen.findByRole("button", { name: /Rediger Høstcup/ }));
      const editor = screen.getByRole("dialog", { name: "Høstcup" });
      await fireEvent.click(within(editor).getByRole("button", { name: /Tider/ }));
      const bookings = await within(editor).findAllByRole("button", { name: /Rediger Bane 1/ });
      await fireEvent.click(bookings[0]);
      await fireEvent.click(screen.getByRole("button", { name: "Avlys banetid" }));
      expect(screen.queryByRole("dialog", { name: "Avlys banetid" })).toBeNull();
      if (avvist) {
        const bookingEditor = screen.getByRole("dialog", { name: "Rediger banetid" });
        expect(
          await within(bookingEditor).findByText("Tiden kunne ikke avlyses nå.")
        ).toBeVisible();
        expect(deleted).toBe(false);
      } else {
        await waitFor(() =>
          expect(screen.queryByRole("dialog", { name: "Rediger banetid" })).toBeNull()
        );
        expect(await within(editor).findByText("1 banetid")).toBeVisible();
        expect(deleted).toBe(true);
      }
    }
  );

  it("oppretter fra lokal staging etter backendforhåndsvisning", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    await screen.findByText("Høstcup");
    await fireEvent.click(screen.getByRole("button", { name: "Nytt arrangement" }));
    const dialog = screen.getByRole("dialog", { name: "Opprett arrangement" });
    await fireEvent.input(within(dialog).getByRole("textbox", { name: "Tittel" }), {
      target: { value: " Sommerkurs for juniorer " },
    });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Neste: Tider" }));
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Alle ukedager i perioden" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Bane 1" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "08:00" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Legg forslag i listen" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/arrangement/forhandsvis",
        expect.objectContaining({ method: "POST" })
      )
    );
    await fireEvent.click(within(dialog).getByRole("button", { name: "Opprett arrangement (1)" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/arrangement",
        expect.objectContaining({
          method: "POST",
          json: expect.objectContaining({
            eksplisitteSlots: [expect.objectContaining({ baneId: "court-1" })],
            tittel: "Sommerkurs for juniorer",
          }),
        })
      )
    );
    expect(await screen.findByText("Arrangementet er opprettet")).toBeVisible();
  });

  it("viser eksisterende tittel og oppdaterer den i arrangementsoversikten etter lagring", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    await fireEvent.click(await screen.findByRole("button", { name: /Rediger Høstcup/ }));
    const dialog = screen.getByRole("dialog", { name: "Høstcup" });
    const title = within(dialog).getByRole("textbox", { name: "Tittel" });
    expect(title).toHaveValue("Høstcup");
    await fireEvent.input(title, { target: { value: " Høstcup for juniorer " } });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Lagre informasjon" }));

    expect(await screen.findByText("Informasjonen er lagret")).toBeVisible();
    expect(screen.getByRole("dialog", { name: "Høstcup for juniorer" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Rediger Høstcup for juniorer/ })).toBeVisible();
    expect(request).toHaveBeenCalledWith(
      "klubb/fjordvik/arrangement/event-1/metadata",
      expect.objectContaining({
        method: "PATCH",
        json: expect.objectContaining({ tittel: "Høstcup for juniorer", kategori: "Turnering" }),
      })
    );
  });

  it("beholder informasjonsskjemaet når tittelen bare inneholder blanktegn", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    await fireEvent.click(await screen.findByRole("button", { name: "Nytt arrangement" }));
    const dialog = screen.getByRole("dialog", { name: "Opprett arrangement" });
    await fireEvent.input(within(dialog).getByRole("textbox", { name: "Tittel" }), {
      target: { value: "   " },
    });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Neste: Tider" }));

    expect(within(dialog).getByText("Tittelen må være mellom 3 og 100 tegn.")).toBeVisible();
    expect(within(dialog).getByRole("button", { name: /Informasjon/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(request.mock.calls.some(([path]) => path.endsWith("forhandsvis"))).toBe(false);
  });

  it("sjekker nye forslag mot egne eksisterende tider ved redigering", async () => {
    const fallback = createRequest();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
      if (path.endsWith("bookinger") && !options?.method) {
        return [{ ...arrangementBooking, dato: date, startTid: "08:30", sluttTid: "09:30" }];
      }
      if (path === "klubb/fjordvik/arrangement/forhandsvis") {
        const body = options?.json as { eksplisitteSlots: Array<Record<string, string>> };
        return {
          ledige: [],
          konflikter: body.eksplisitteSlots.map((slot) => ({ ...slot, baneNavn: court.navn })),
        };
      }
      return fallback(path, options);
    });
    render(AdminFixture, { request: request as ApiClient["request"] });
    await fireEvent.click(await screen.findByRole("button", { name: /Rediger Høstcup/ }));
    const dialog = screen.getByRole("dialog", { name: "Høstcup" });
    await fireEvent.click(within(dialog).getByRole("button", { name: /Tider/ }));
    await within(dialog).findByText("1 banetid");
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Alle ukedager i perioden" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Bane 1" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "08:00" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Legg forslag i listen" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/arrangement/forhandsvis",
        expect.objectContaining({
          method: "POST",
          json: expect.objectContaining({
            eksplisitteSlots: [
              { baneId: court.id, dato: date, startTid: "08:00", sluttTid: "09:00" },
            ],
          }),
        })
      )
    );
    expect(await within(dialog).findByText("Tidspunktet er allerede opptatt.")).toBeVisible();
    expect(within(dialog).queryByRole("button", { name: /Opprett .* forslag/ })).toBeNull();
    expect(within(dialog).getAllByRole("button", { name: /Rediger Bane 1/ })).toHaveLength(2);
    expect(request.mock.calls.some(([path]) => path.endsWith("bookinger/batch"))).toBe(false);
  });

  it("beholder konfliktforslag når et annet forslag lagres", async () => {
    const fallback = createRequest();
    const request = vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
      if (path === "klubb/fjordvik/arrangement/forhandsvis") {
        const body = options?.json as { eksplisitteSlots: Array<Record<string, string>> };
        return {
          ledige: body.eksplisitteSlots.filter((slot) => slot.startTid === "09:00"),
          konflikter: body.eksplisitteSlots.filter((slot) => slot.startTid === "08:00"),
        };
      }
      if (path.endsWith("bookinger/batch")) {
        const body = options?.json as { bookinger: Array<Record<string, string>> };
        return {
          feilet: [],
          opprettet: body.bookinger.map((slot) => ({
            ...slot,
            bookingId: "saved-booking",
            baneNavn: court.navn,
          })),
        };
      }
      return fallback(path, options);
    });
    render(AdminFixture, { request: request as ApiClient["request"] });
    await fireEvent.click(await screen.findByRole("button", { name: /Rediger Høstcup/ }));
    const dialog = screen.getByRole("dialog", { name: "Høstcup" });
    await fireEvent.click(within(dialog).getByRole("button", { name: /Tider/ }));
    await within(dialog).findByText("1 banetid");
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Alle ukedager i perioden" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Bane 1" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "08:00" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "09:00" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Legg forslag i listen" }));
    expect(await within(dialog).findByText("Tidspunktet er allerede opptatt.")).toBeVisible();
    await fireEvent.click(within(dialog).getByRole("button", { name: /Opprett 1 forslag/ }));
    expect(await within(dialog).findByText("1 banetid ble opprettet")).toBeVisible();
    expect(within(dialog).getByText("Tidspunktet er allerede opptatt.")).toBeVisible();
    expect(within(dialog).getAllByRole("button", { name: /Rediger Bane 1/ })).toHaveLength(3);
    expect(request).toHaveBeenCalledWith(
      "klubb/fjordvik/arrangement/event-1/bookinger/batch",
      expect.objectContaining({
        json: { bookinger: [expect.objectContaining({ startTid: "09:00" })] },
      })
    );
  });

  it("blokkerer arbeidsflaten lukket uten arrangement:se", () => {
    const result = render(AdminFixture, {
      capabilities: [],
      request: createRequest() as ApiClient["request"],
    });
    expect(screen.getByText("Du har ikke tilgang til arrangementadministrasjon")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Nytt arrangement" })).toBeNull();
    expect(result.container.querySelector('[data-ui="collection"]')).toBeNull();
  });
});
