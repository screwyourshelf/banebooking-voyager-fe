// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { KunngjøringAdminRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import AnnouncementAdminFixture from "./AnnouncementAdminFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

const richContent = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Før du fortsetter", marks: [{ type: "bold" }] }],
    },
    { type: "paragraph", content: [{ type: "text", text: "Les den nye baneregelen." }] },
  ],
});

function announcement(): KunngjøringAdminRespons {
  return {
    id: "announcement-1",
    tittel: "Ny baneregel",
    tekst: richContent,
    opprettetTidspunkt: "2026-08-23T10:00:00Z",
    utløperTidspunkt: "2026-09-01T00:00:00Z",
    antallBekreftelser: 1,
    antallMålgruppe: 4,
    bekreftelser: [
      {
        visningsnavn: "Ola Medlem",
        epost: "ola@example.no",
        bekreftetTidspunkt: "2026-08-23T11:00:00Z",
      },
    ],
  };
}

function createRequest(initial: KunngjøringAdminRespons | null = null) {
  let active = initial;
  return vi.fn(async (path: string, options?: { method?: string }) => {
    const method = options?.method ?? "GET";
    if (path.endsWith("/kunngjøringer/aktiv") && method === "GET") return active;
    if (path.endsWith("/kunngjøringer/announcement-1") && method === "DELETE") {
      active = null;
      return undefined;
    }
    throw new Error(`Uventet API-kall: ${method} ${path}`);
  });
}

describe("AnnouncementAdminScreen", () => {
  it("viser tomtilstand og en tilgjengelig editor med fokusert feltvalidering", async () => {
    render(AnnouncementAdminFixture, {
      request: createRequest() as ApiClient["request"],
    });

    expect(await screen.findByText("Klar for neste beskjed")).toBeVisible();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: "Ny kunngjøring" }));
    const editor = await screen.findByRole("textbox", { name: "Budskap" });
    await fireEvent.click(screen.getByRole("button", { name: "Publiser kunngjøring" }));
    const title = screen.getByRole("textbox", { name: "Tittel" });
    expect(title).toHaveFocus();
    expect(title).toHaveAccessibleDescription(expect.stringContaining("Skriv inn en tittel"));
    expect(editor).toHaveAttribute("aria-invalid", "true");
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });

  it("viser formatert aktiv kunngjøring, bekreftelser og deaktiverer gjennom typed mutation", async () => {
    const request = createRequest(announcement());
    render(AnnouncementAdminFixture, { request: request as ApiClient["request"] });

    await fireEvent.click(await screen.findByRole("button", { name: "Åpne Ny baneregel" }));
    const dialog = screen.getByRole("dialog", { name: "Ny baneregel" });
    expect(within(dialog).getByRole("heading", { name: "Før du fortsetter" })).toBeVisible();
    expect(within(dialog).getByText("Les den nye baneregelen.")).toBeVisible();
    expect(within(dialog).getByText("Ola Medlem")).toBeVisible();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);

    await fireEvent.click(within(dialog).getByRole("button", { name: "Deaktiver kunngjøring" }));
    await waitFor(() => expect(screen.getByText("Klar for neste beskjed")).toBeVisible());
    expect(request).toHaveBeenCalledWith("klubb/fjordvik/kunngjøringer/announcement-1", {
      auth: "required",
      method: "DELETE",
    });
  });

  it("beholder lesekonteksten ved feil og tilbyr retry", async () => {
    let attempt = 0;
    const request = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("Tjenesten svarer ikke");
      return null;
    });
    render(AnnouncementAdminFixture, { request: request as ApiClient["request"] });

    expect(await screen.findByRole("alert")).toHaveTextContent("Tjenesten svarer ikke");
    await fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(await screen.findByText("Klar for neste beskjed")).toBeVisible();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("låser dismissveiene mens deaktivering pågår og beholder mutationfeilen i dialogen", async () => {
    let rejectDeactivate: (error: Error) => void = () => undefined;
    const request = vi.fn(async (path: string, options?: { method?: string }): Promise<unknown> => {
      const method = options?.method ?? "GET";
      if (path.endsWith("/kunngjøringer/aktiv") && method === "GET") return announcement();
      if (path.endsWith("/kunngjøringer/announcement-1") && method === "DELETE") {
        return await new Promise((_, reject) => {
          rejectDeactivate = reject;
        });
      }
      throw new Error(`Uventet API-kall: ${method} ${path}`);
    });
    render(AnnouncementAdminFixture, { request: request as ApiClient["request"] });

    await fireEvent.click(await screen.findByRole("button", { name: "Åpne Ny baneregel" }));
    const dialog = screen.getByRole("dialog", { name: "Ny baneregel" });
    const deactivate = within(dialog).getByRole("button", { name: "Deaktiver kunngjøring" });
    await fireEvent.click(deactivate);
    await waitFor(() => expect(deactivate).toBeDisabled());

    await fireEvent.keyDown(dialog, { key: "Escape" });
    expect(dialog).toBeVisible();
    rejectDeactivate(new Error("Deaktivering feilet"));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Deaktivering feilet");
  });
});
