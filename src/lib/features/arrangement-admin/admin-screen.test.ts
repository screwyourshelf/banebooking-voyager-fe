// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import AdminFixture from "./AdminFixture.test.svelte";
import { activity, arrangement, arrangementBooking, court } from "./admin-test-data";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

function createRequest() {
  return vi.fn(async (path: string, options?: { method?: string; json?: unknown }) => {
    if (path.endsWith("arrangementer")) return [arrangement];
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
    return undefined;
  });
}

describe("arrangement administration", () => {
  it("viser kapabilitetsstyrt oversikt, editorsteg og har ingen oppdagede a11y-brudd", async () => {
    const result = render(AdminFixture, {
      request: createRequest() as ApiClient["request"],
    });

    expect(
      await screen.findByRole("heading", { level: 1, name: "Administrer arrangementer" })
    ).toBeVisible();
    expect(await screen.findByText("Høstcup")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: /Rediger Høstcup/ }));
    const dialog = screen.getByRole("dialog", { name: "Høstcup" });
    expect(within(dialog).getByRole("button", { name: /Informasjon/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
    await fireEvent.click(within(dialog).getByRole("button", { name: /Tider/ }));
    expect(await within(dialog).findByText("1 banetid")).toBeVisible();
    expect(within(dialog).getByRole("button", { name: /Rediger Bane 1/ })).toBeVisible();
  });

  it("oppretter fra lokal staging etter backendforhåndsvisning", async () => {
    const request = createRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });
    await screen.findByText("Høstcup");
    await fireEvent.click(screen.getByRole("button", { name: "Nytt arrangement" }));
    const dialog = screen.getByRole("dialog", { name: "Opprett arrangement" });
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
          }),
        })
      )
    );
    expect(await screen.findByText("Arrangementet er opprettet")).toBeVisible();
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
