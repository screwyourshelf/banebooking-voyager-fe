// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import StatisticsFixture from "./StatisticsFixture.test.svelte";
import { createStatisticsData } from "./statistics-test-data";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

const activities = [
  {
    id: "activity-tennis",
    navn: "Tennis",
    slug: "tennis",
    aktiv: true,
    sortering: 1,
    banereglement: "",
    bookingInnstillinger: {},
    kapabiliteter: [],
  },
];
const courts = [
  {
    id: "court-center",
    navn: "Senterbanen",
    beskrivelse: "",
    aktiv: true,
    sortering: 1,
    grenId: "activity-tennis",
    grenNavn: "Tennis",
    kapabiliteter: [],
    bookingInnstillinger: {},
    harOverstyring: false,
    bookingOverstyring: null,
  },
];

function createRequest(statistics = createStatisticsData()) {
  return vi.fn(async (path: string) => {
    if (path.includes("/grener?")) return activities;
    if (path.includes("/baner?")) return courts;
    if (path.includes("/statistikk/bookinger?")) return statistics;
    throw new Error(`Uventet API-kall: ${path}`);
  });
}

describe("StatisticsScreen", () => {
  it("viser full banebruk med tilgjengelige filtre og visualiseringer", async () => {
    const { container } = render(StatisticsFixture, {
      request: createRequest() as ApiClient["request"],
    });

    expect(screen.getByRole("heading", { name: "Statistikk" })).toBeVisible();
    expect(await screen.findByText("44,5 t")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Linjediagram over bookede timer per måned" })
    ).toBeVisible();
    expect(screen.getByRole("img", { name: "Fordeling mellom bookingtyper" })).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Stolpediagram over bookede timer per klokkeslett" })
    ).toBeVisible();
    expect(container.querySelectorAll('[data-ui="data-visualization"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-ui="data-table"]').length).toBeGreaterThan(0);
    expect(container.querySelector("[data-stat-role]")).not.toBeInTheDocument();
    expect(container.querySelector('[class*="statistics-"]')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tennis" })).toBeEnabled();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });

  it("beholder forrige statistikk synlig under bakgrunnsrefresh", async () => {
    let resolveFiltered: (value: unknown) => void = () => undefined;
    const request = vi.fn(async (path: string) => {
      if (path.includes("/grener?")) return activities;
      if (path.includes("/baner?")) return courts;
      if (path.includes("grenId=activity-tennis")) {
        return await new Promise((resolve) => {
          resolveFiltered = resolve;
        });
      }
      if (path.includes("/statistikk/bookinger?")) return createStatisticsData();
      throw new Error(`Uventet API-kall: ${path}`);
    });
    render(StatisticsFixture, { request: request as ApiClient["request"] });

    expect(await screen.findByText("44,5 t")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Tennis" }));
    expect(screen.getByText("44,5 t")).toBeVisible();
    expect(within(screen.getByRole("tabpanel")).getByText("Oppdaterer…")).toBeVisible();

    resolveFiltered(
      createStatisticsData({
        nøkkeltall: {
          antallBookinger: 10,
          bookedeTimer: 12,
          personligeBookinger: 8,
          arrangementbookinger: 2,
        },
      })
    );
    expect(await screen.findByText("12 t")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Baner" })).toBeVisible();
  });

  it("viser medlemsstatistikk og lokalt bookingtypevalg", async () => {
    render(StatisticsFixture, { request: createRequest() as ApiClient["request"] });
    await screen.findByText("44,5 t");

    await fireEvent.click(screen.getByRole("tab", { name: "Medlemmer" }));
    const activeUsers = await screen.findByText("Aktive brukere");
    expect(activeUsers.parentElement).toHaveTextContent(/8\s*brukere/);
    expect(screen.getByText("Ada Lovelace")).toBeVisible();
    await fireEvent.click(screen.getByRole("button", { name: "Arrangement" }));
    await waitFor(() => expect(activeUsers.parentElement).toHaveTextContent(/3\s*brukere/));
    expect(screen.getByText("Ingen aktive brukere")).toBeVisible();
  });

  it("viser tomt datagrunnlag uten å presentere det som lasting", async () => {
    const empty = createStatisticsData({
      nøkkeltall: {
        antallBookinger: 0,
        bookedeTimer: 0,
        personligeBookinger: 0,
        arrangementbookinger: 0,
      },
    });
    render(StatisticsFixture, { request: createRequest(empty) as ApiClient["request"] });

    const activePanel = await screen.findByRole("tabpanel");
    expect(within(activePanel).getByText("Ingen bookinger i perioden")).toBeVisible();
    expect(screen.queryByLabelText("Laster statistikk")).not.toBeInTheDocument();
  });

  it("beholder sidekonteksten ved lesefeil og tilbyr retry", async () => {
    let attempts = 0;
    const request = vi.fn(async (path: string) => {
      if (path.includes("/grener?")) return activities;
      if (path.includes("/baner?")) return courts;
      if (path.includes("/statistikk/bookinger?")) {
        attempts += 1;
        if (attempts === 1) throw new Error("Statistikktjenesten svarer ikke");
        return createStatisticsData();
      }
      throw new Error(`Uventet API-kall: ${path}`);
    });
    render(StatisticsFixture, { request: request as ApiClient["request"] });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Statistikktjenesten svarer ikke");
    await fireEvent.click(within(alert).getByRole("button", { name: "Prøv igjen" }));
    await waitFor(() => expect(screen.getByText("44,5 t")).toBeVisible());
    expect(attempts).toBe(2);
  });
});
