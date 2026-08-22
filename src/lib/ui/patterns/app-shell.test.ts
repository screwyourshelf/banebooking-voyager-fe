// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import AppShellFixture from "./AppShellFixture.test.svelte";
import AppShellLoadingFixture from "./AppShellLoadingFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom cannot calculate final theme contrast.
  rules: { "color-contrast": { enabled: false } },
};

describe("public app shell pattern", () => {
  it("owns one workspace landmark around responsive navigation surfaces", () => {
    const { container } = render(AppShellFixture, { onTheme: () => undefined });

    expect(screen.getByRole("main")).toHaveAttribute("data-part", "main");
    expect(screen.getByRole("navigation", { name: "Hovednavigasjon" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobilverktøy" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobilnavigasjon" })).toBeInTheDocument();
    expect(container.querySelector('[data-part="sidebar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="topbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-part="bottom-navigation"]')).toBeInTheDocument();
  });

  it("keeps navigation and workspace controls in predictable document order", async () => {
    const onTheme = vi.fn();
    const { container } = render(AppShellFixture, { onTheme });
    const focusTargets = Array.from(
      container.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button")
    );

    expect(focusTargets.map((element) => element.textContent?.trim())).toEqual([
      "Fjordvik Tennisklubb Banebooking",
      "Book bane",
      "Fjordvik Tennisklubb",
      "Bytt tema",
      "Siste nytt",
      "Book",
      "Arrangementer",
    ]);

    const mobileTools = screen.getByRole("navigation", { name: "Mobilverktøy" });
    const themeButton = within(mobileTools).getByRole("button", { name: "Bytt tema" });
    themeButton.focus();
    expect(themeButton).toHaveFocus();
    await fireEvent.click(themeButton);
    expect(onTheme).toHaveBeenCalledOnce();
  });

  it("reserves final sidebar, topbar, bottom navigation and workspace geometry during boot", () => {
    const { container } = render(AppShellLoadingFixture);

    expect(container.querySelector('[data-ui="app-shell"]')).toHaveAttribute(
      "data-navigation-state",
      "loading"
    );
    expect(screen.getAllByRole("status", { name: "Laster navigasjon …" })).toHaveLength(2);
    expect(container.querySelectorAll('[data-part="topbar-loading"] > span')).toHaveLength(3);
    expect(screen.getByRole("main")).toBeEmptyDOMElement();
  });

  it("has no detectable accessibility violations in ready and loading states", async () => {
    const ready = render(AppShellFixture, { onTheme: () => undefined });
    expect((await axe.run(ready.container, axeOptions)).violations).toEqual([]);
    ready.unmount();

    const loading = render(AppShellLoadingFixture);
    expect((await axe.run(loading.container, axeOptions)).violations).toEqual([]);
  });
});
