// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeedItemRespons } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import ArrangementsFixture from "./arrangements/ArrangementsFixture.test.svelte";
import { createArrangement } from "./arrangements/arrangement-test-data";
import NewsFixture from "./news/NewsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("public arrangements", () => {
  it("bruker innlogget endpoint, åpner URL-valgt detalj og viser kapabilitetsstyrt avlysning", async () => {
    const arrangements = [
      createArrangement(),
      createArrangement({
        id: "event-2",
        tittel: "Padelkveld",
        beskrivelse: "Åpen kveld for alle nivåer.",
        grenNavn: "Padel",
        grenSlug: "padel",
        kapabiliteter: [],
      }),
    ];
    const request = vi.fn(async (path: string, options?: { method?: string }) => {
      if (options?.method === "DELETE") throw new Error("Arrangementet har aktive påmeldinger.");
      if (path.includes("arrangementer")) return arrangements;
      throw new Error(`Uventet kall: ${path}`);
    });
    const result = render(ArrangementsFixture, {
      authenticated: true,
      initialArrangementId: "event-1",
      request: request as ApiClient["request"],
    });

    expect(await screen.findByRole("heading", { level: 1, name: "Arrangementer" })).toBeVisible();
    expect(await screen.findByText("Velkommen til klubbens årlige høstcup.")).toBeVisible();
    expect(request).toHaveBeenCalledWith("klubb/fjordvik/arrangementer", {
      signal: expect.any(AbortSignal),
    });
    expect(screen.getByRole("button", { name: "Avlys" })).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: "Avlys" }));
    const dialog = screen.getByRole("dialog", { name: "Avlys arrangement" });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Ja, avlys" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Arrangementet har aktive påmeldinger."
    );
  });

  it("bruker offentlig historikkvariant og tilbyr grenfilter med nullstilling", async () => {
    const arrangements = [
      createArrangement(),
      createArrangement({ id: "event-2", tittel: "Padelkveld", grenNavn: "Padel" }),
    ];
    const request = vi.fn().mockResolvedValue(arrangements);
    render(ArrangementsFixture, {
      request: request as ApiClient["request"],
    });

    expect(await screen.findByText("Høstcup")).toBeVisible();
    await fireEvent.click(screen.getByRole("switch", { name: "Vis tidligere" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "offentlig/klubb/fjordvik/arrangementer/visning?inkluderHistoriske=true",
        { signal: expect.any(AbortSignal) }
      )
    );
    await fireEvent.click(screen.getByRole("button", { name: "Tennis" }));
    expect(screen.queryByText("Padelkveld")).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(await screen.findByText("Padelkveld")).toBeVisible();
  });

  it("reserverer listegeometri og går til eksplisitt tomtilstand", async () => {
    let resolveRequest!: (value: []) => void;
    const pending = new Promise<[]>((resolve) => {
      resolveRequest = resolve;
    });
    render(ArrangementsFixture, {
      request: vi.fn(() => pending) as unknown as ApiClient["request"],
    });

    expect(await screen.findByRole("status", { name: "Laster arrangementer" })).toBeVisible();
    resolveRequest([]);
    expect(await screen.findByText("Ingen kommende arrangementer")).toBeVisible();
  });
});

describe("public news", () => {
  const feed: FeedItemRespons[] = Array.from({ length: 12 }, (_, index) => ({
    tittel: `Nyhet ${index + 1}`,
    innhold: `<p>Innhold ${index + 1}</p>`,
    lenke: index === 0 ? "https://example.no/sak" : "",
    publisertDato: "2026-08-23T12:00:00Z",
  }));

  it("viser sikker ekstern lenke, lokal paginering og tilgjengelig liste", async () => {
    const result = render(NewsFixture, {
      request: vi.fn().mockResolvedValue(feed) as ApiClient["request"],
    });

    expect(await screen.findByRole("heading", { level: 1, name: "Nyheter" })).toBeVisible();
    const link = screen.getByRole("link", { name: "Les mer" });
    expect(link).toHaveAttribute("href", "https://example.no/sak");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByText("Nyhet 12")).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Vis flere (2 gjenstår)" }));
    expect(screen.getByText("Nyhet 12")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });

  it("viser retrybar feil og tomtilstand", async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("Nettverket er nede"))
      .mockResolvedValueOnce([]);
    render(NewsFixture, {
      request: request as ApiClient["request"],
    });

    expect(await screen.findByText("Kunne ikke laste nyhetene")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(await screen.findByText("Ingen nyheter akkurat nå")).toBeVisible();
  });
});
