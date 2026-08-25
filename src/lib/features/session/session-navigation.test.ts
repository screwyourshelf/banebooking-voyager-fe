// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import SessionNavigationFixture from "./SessionNavigationFixture.test.svelte";

vi.mock("tabbable", () => {
  function controls(container: HTMLElement) {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  return {
    focusable: controls,
    isFocusable: (element: HTMLElement) => !element.hasAttribute("disabled"),
    tabbable: controls,
  };
});

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture() {
  const callbacks = { onSignOut: vi.fn(), onTheme: vi.fn() };
  return { callbacks, result: render(SessionNavigationFixture, callbacks) };
}

afterEach(() => {
  document.body.focus();
});

describe("session navigation composition", () => {
  it("composes tenant identity, capability links and compound route activity", () => {
    renderFixture();
    const desktop = screen.getByRole("navigation", { name: "Hovednavigasjon" });

    expect(desktop).toHaveAttribute("data-surface", "shell");
    expect(desktop).toHaveClass("max-w-none", "flex-1", "bg-transparent", "p-0");
    expect(within(desktop).getByRole("link", { name: /Fjordvik Tennisklubb/ })).toHaveAttribute(
      "href",
      "/fjordvik"
    );
    expect(within(desktop).getByRole("link", { name: /Fjordvik Tennisklubb/ })).toHaveClass(
      "text-sidebar-text"
    );
    expect(within(desktop).getByRole("link", { name: "Baner og grener" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(desktop).getByRole("link", { name: "Book bane" })).toBeVisible();
    expect(within(desktop).getByRole("link", { name: "Brukere" })).toBeVisible();
    expect(within(desktop).queryByRole("link", { name: "Statistikk" })).toBeNull();
  });

  it("uses tenant logos with the legacy webp and default fallbacks", async () => {
    renderFixture();
    const desktop = screen.getByRole("navigation", { name: "Hovednavigasjon" });
    const identity = within(desktop).getByRole("link", { name: /Fjordvik Tennisklubb/ });
    const logo = identity.querySelector("img");

    expect(logo).toHaveAttribute("src", "/klubber/fjordvik/img/logo.svg");
    await fireEvent.error(logo!);
    expect(logo).toHaveAttribute("src", "/klubber/fjordvik/img/logo.webp");
    await fireEvent.error(logo!);
    expect(logo).toHaveAttribute("src", "/klubber/default/img/logo.svg");
  });

  it("toggles the shared theme action without replacing its focus target", async () => {
    const { callbacks } = renderFixture();
    const desktop = screen.getByRole("navigation", { name: "Hovednavigasjon" });
    const theme = within(desktop).getByRole("button", { name: "Bruk mørkt tema" });

    theme.focus();
    await fireEvent.click(theme);

    expect(callbacks.onTheme).toHaveBeenCalledOnce();
    expect(within(desktop).getByRole("button", { name: "Bruk lyst tema" })).toHaveFocus();
  });

  it("opens the account overlay, closes on Escape and returns focus to the account action", async () => {
    renderFixture();
    const desktop = screen.getByRole("navigation", { name: "Hovednavigasjon" });
    const trigger = within(desktop).getByRole("button", {
      name: "Kari Nordmann · Klubbadministrator",
    });

    trigger.focus();
    await fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Kari Nordmann" });
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Lukk meny" })).toHaveFocus()
    );

    await fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Kari Nordmann" })).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("keeps primary mobile destinations out of More and exposes semantic sign-out", async () => {
    const { callbacks } = renderFixture();
    const bottom = screen.getByRole("navigation", { name: "Mobilnavigasjon" });
    const more = within(bottom).getByRole("button", { name: "Mer" });

    await fireEvent.click(more);
    const dialog = await screen.findByRole("dialog", { name: "Kari Nordmann" });
    const menu = within(dialog).getByRole("navigation", { name: "Mer" });

    expect(dialog).toHaveAttribute("data-placement", "bottom");
    expect(dialog).toHaveClass(
      "bottom-0",
      "w-navigation-overlay-more",
      "max-h-navigation-overlay-more",
      "rounded-navigation-overlay-more",
      "pb-navigation-safe"
    );
    expect(menu).toHaveAttribute("data-surface", "overlay");
    expect(menu).toHaveClass("max-w-none", "bg-transparent", "text-ink");
    expect(within(menu).getByRole("link", { name: "Min side" })).toBeVisible();
    expect(within(menu).getByRole("link", { name: "Brukere" })).toBeVisible();
    expect(within(menu).queryByRole("link", { name: "Book bane" })).toBeNull();
    expect(within(menu).queryByRole("link", { name: "Mine tider" })).toBeNull();
    expect(within(menu).queryByRole("link", { name: "Arrangementer" })).toBeNull();

    await fireEvent.click(within(menu).getByRole("button", { name: "Logg ut" }));
    expect(callbacks.onSignOut).toHaveBeenCalledOnce();

    await fireEvent.click(within(dialog).getByRole("button", { name: "Lukk meny" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Kari Nordmann" })).toBeNull());
  });

  it("has no detectable accessibility violations in the shell and More overlay", async () => {
    const { result } = renderFixture();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);

    const bottom = screen.getByRole("navigation", { name: "Mobilnavigasjon" });
    await fireEvent.click(within(bottom).getByRole("button", { name: "Mer" }));
    const dialog = await screen.findByRole("dialog", { name: "Kari Nordmann" });
    expect((await axe.run(dialog, axeOptions)).violations).toEqual([]);

    await fireEvent.click(within(dialog).getByRole("button", { name: "Lukk meny" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Kari Nordmann" })).toBeNull());
  });
});
