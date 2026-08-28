// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "$lib/platform/api";
import AdminFixture from "./AdminFixture.test.svelte";
import { createActivity, createCourt } from "./admin-test-data";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

function createAdminRequest(options: { failActivityCreate?: boolean } = {}) {
  const activities = [
    createActivity(),
    createActivity({ id: "activity-2", navn: "Padel", slug: "padel", sortering: 1 }),
  ];
  const courts = [
    createCourt(),
    createCourt({ id: "court-2", navn: "Bane 2", sortering: 1 }),
    createCourt({
      id: "court-3",
      navn: "Padelbane",
      grenId: "activity-2",
      grenNavn: "Padel",
      sortering: 0,
    }),
  ];

  return vi.fn(async (path: string, requestOptions?: { method?: string }) => {
    if (path.endsWith("baner?inkluderInaktive=true")) return courts;
    if (path.endsWith("grener?inkluderInaktive=true")) return activities;
    if (
      options.failActivityCreate &&
      path.endsWith("grener") &&
      requestOptions?.method === "POST"
    ) {
      throw new Error("En gren med dette navnet finnes allerede.");
    }
    return undefined;
  });
}

describe("court administration workspace", () => {
  it("viser kapabilitetsstyrte seksjoner, filter og tilgjengelig reorder", async () => {
    const request = createAdminRequest();
    const result = render(AdminFixture, {
      request: request as ApiClient["request"],
    });

    expect(await screen.findByRole("heading", { level: 1, name: "Baner og grener" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Baner" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Grener" })).toHaveAttribute(
      "href",
      "/fjordvik/admin/grener"
    );
    expect(await screen.findByText("Padelbane")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);

    await fireEvent.click(screen.getByRole("button", { name: "Filtre" }));
    await fireEvent.click(screen.getByRole("button", { name: "Padel" }));
    expect(screen.getByText("Padelbane")).toBeVisible();
    expect(screen.queryByText("Bane 1")).not.toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Nullstill" }));
    expect(await screen.findByText("Bane 1")).toBeVisible();

    await fireEvent.click(screen.getByRole("button", { name: "Flytt Bane 2 opp" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/baner/court-2",
        expect.objectContaining({ method: "PUT", json: expect.objectContaining({ sortering: 0 }) })
      )
    );
  });

  it("bevarer ulagret utkast, validerer og lagrer bane samt bookingoverstyring", async () => {
    const request = createAdminRequest();
    render(AdminFixture, { request: request as ApiClient["request"] });

    await screen.findByText("Bane 1");
    await fireEvent.click(screen.getByRole("button", { name: "Åpne Bane 1" }));
    let dialog = screen.getByRole("dialog", { name: "Bane 1" });
    const name = within(dialog).getByRole("textbox", { name: /Navn/ });
    await fireEvent.input(name, { target: { value: "" } });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Lagre endringer" }));
    expect(await within(dialog).findByText("Navn er påkrevd.")).toBeVisible();

    await fireEvent.input(name, { target: { value: "Bane A" } });
    dialog = screen.getByRole("dialog", { name: "Bane A" });
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Avvik fra grenstandard" }));
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Egen åpningstid" }));
    await fireEvent.input(within(dialog).getByRole("slider", { name: "Åpningstid" }), {
      target: { value: "8" },
    });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Lagre endringer" }));

    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/baner/court-1",
        expect.objectContaining({
          method: "PUT",
          json: expect.objectContaining({ navn: "Bane A" }),
        })
      )
    );
    expect(request).toHaveBeenCalledWith(
      "klubb/fjordvik/baner/court-1/booking-innstillinger",
      expect.objectContaining({
        method: "PUT",
        json: expect.objectContaining({ aapningstid: "08:00" }),
      })
    );
    await fireEvent.click(within(dialog).getByRole("button", { name: "Alle baner" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("viser eksplisitt tomtilstand når klubben mangler oppsett", async () => {
    const request = vi.fn().mockResolvedValue([]);
    render(AdminFixture, { request: request as ApiClient["request"] });

    expect(await screen.findByText("Ingen baner ennå")).toBeVisible();
    expect(
      screen.getByText("Opprett og aktiver en gren før du legger til den første banen.")
    ).toBeVisible();
  });
});

describe("activity administration workspace", () => {
  it("redigerer aktiv-state og viser vedvarende opprettingsfeil", async () => {
    const request = createAdminRequest({ failActivityCreate: true });
    render(AdminFixture, {
      section: "activities",
      request: request as ApiClient["request"],
    });

    await screen.findByText("Tennis");
    await fireEvent.click(screen.getByRole("button", { name: "Åpne Tennis" }));
    let dialog = screen.getByRole("dialog", { name: "Tennis" });
    await fireEvent.click(within(dialog).getByRole("switch", { name: "Aktiv" }));
    await fireEvent.click(within(dialog).getByRole("button", { name: "Lagre endringer" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        "klubb/fjordvik/grener/activity-1",
        expect.objectContaining({ method: "PUT", json: expect.objectContaining({ aktiv: false }) })
      )
    );

    await fireEvent.click(within(dialog).getByRole("button", { name: "Alle grener" }));
    await fireEvent.click(screen.getByRole("button", { name: "Ny gren" }));
    dialog = screen.getByRole("dialog", { name: "Opprett gren" });
    await fireEvent.input(within(dialog).getByRole("textbox", { name: /Navn/ }), {
      target: { value: "Tennis" },
    });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Opprett gren" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "En gren med dette navnet finnes allerede."
    );
    await fireEvent.click(within(dialog).getByRole("button", { name: "Alle grener" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("skjuler utilgjengelig naboseksjon og blokkerer feil seksjon lukket", () => {
    const request = createAdminRequest();
    const result = render(AdminFixture, {
      section: "activities",
      capabilities: ["baner:admin"],
      request: request as ApiClient["request"],
    });

    expect(screen.queryByRole("link", { name: "Grener" })).not.toBeInTheDocument();
    expect(screen.getByText("Du har ikke tilgang til grener")).toBeVisible();
    expect(result.container.querySelector('[data-ui="collection"]')).not.toBeInTheDocument();
  });
});
