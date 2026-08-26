// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import NavigationFixture from "./NavigationFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture(options: { pending?: boolean; showAdmin?: boolean } = {}) {
  const callbacks = {
    onBack: vi.fn(),
    onTheme: vi.fn(),
  };

  return {
    callbacks,
    result: render(NavigationFixture, { ...callbacks, ...options }),
  };
}

describe("public Navigation patterns", () => {
  it("owns labelled navigation, grouped links and tenant identity", () => {
    renderFixture();

    const identity = screen.getByRole("link", { name: /Fjordvik Tennisklubb/ });
    expect(identity).toHaveAttribute("data-ui", "navigation-identity");
    expect(identity).toHaveClass(
      "inline-flex",
      "gap-navigation-item",
      "rounded-navigation-item",
      "text-ink"
    );

    const main = screen.getByRole("navigation", { name: "Hovednavigasjon" });
    expect(main).toHaveAttribute("data-surface", "control");
    expect(main).toHaveClass(
      "grid",
      "max-w-navigation-sidebar",
      "rounded-navigation-sidebar",
      "bg-control-surface"
    );
    expect(within(main).getByRole("heading", { level: 2, name: "Hovedmeny" })).toBeVisible();
    expect(within(main).getByRole("heading", { level: 2, name: "Administrasjon" })).toBeVisible();
    const active = within(main).getByRole("link", { name: "Book bane" });
    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass(
      "rounded-navigation-item",
      "bg-navigation-sidebar-active-surface",
      "text-navigation-sidebar-active"
    );
    expect(within(main).getByLabelText("2 uleste nyheter")).toHaveTextContent("2");
    expect(within(main).getByLabelText("2 uleste nyheter")).toHaveClass(
      "min-w-navigation-badge",
      "rounded-navigation-badge",
      "bg-status-warning-bg"
    );
  });

  it("uses native links for active route and section navigation", () => {
    renderFixture();

    const sections = screen.getByRole("navigation", { name: "Baner og grener" });
    const courts = within(sections).getByRole("link", { name: "Baner" });
    const activities = within(sections).getByRole("link", { name: "Grener" });

    expect(courts.tagName).toBe("A");
    expect(courts).toHaveAttribute("href", "/fjordvik/admin/baner");
    expect(courts).toHaveAttribute("aria-current", "page");
    expect(courts).toHaveClass(
      "min-h-navigation-section-item",
      "after:h-navigation-section-indicator",
      "after:bg-nav-indicator"
    );
    expect(sections).toHaveClass("overflow-x-auto", "border-b", "scrollbar-thin");
    expect(activities).not.toHaveAttribute("aria-current");
  });

  it("owns bottom-navigation and action geometry as static utility sets", () => {
    const { result } = renderFixture();
    const bottom = screen.getByRole("navigation", { name: "Mobilnavigasjon" });
    const list = bottom.querySelector('[data-ui="navigation-list"]');
    const active = within(bottom).getByRole("link", { name: "Book" });
    const iconAction = screen.getByRole("button", { name: "Bruk mørkt tema" });

    expect(list).toHaveClass(
      "grid-flow-col",
      "auto-cols-fr",
      "min-h-navigation-bottom-list",
      "bg-navigation-bottom-surface",
      "pb-navigation-safe",
      "backdrop-blur-navigation-bottom"
    );
    expect(active).toHaveClass(
      "min-h-navigation-bottom-item",
      "before:h-navigation-bottom-indicator",
      "before:rounded-navigation-bottom-indicator"
    );
    expect(iconAction).toHaveClass("size-navigation-action-icon", "p-0");
    expect(
      result.container.querySelector('[data-ui="navigation"][data-layout="actions"]')
    ).toHaveClass("min-w-0");
  });

  it("lets capability owners omit unavailable sections", async () => {
    const { callbacks, result } = renderFixture();
    expect(screen.getByRole("link", { name: "Baner og grener" })).toBeVisible();

    await result.rerender({ ...callbacks, showAdmin: false });
    expect(screen.queryByRole("link", { name: "Baner og grener" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Administrasjon" })).toBeNull();
  });

  it("keeps account and back actions native, focusable and semantic", async () => {
    const { callbacks } = renderFixture();
    const back = screen.getByRole("button", { name: "Alle brukere" });
    const theme = screen.getByRole("button", { name: "Bruk mørkt tema" });

    expect(back).toHaveAttribute("type", "button");
    back.focus();
    expect(back).toHaveFocus();
    theme.focus();
    expect(theme).toHaveFocus();

    await fireEvent.click(back);
    await fireEvent.click(theme);
    expect(callbacks.onBack).toHaveBeenCalledOnce();
    expect(callbacks.onTheme).toHaveBeenCalledOnce();
  });

  it("locks pending actions without hiding their context", async () => {
    const { callbacks, result } = renderFixture({ pending: true });
    const actions = screen.getByRole("navigation", { name: "Kontohandlinger" });
    const back = screen.getByRole("button", { name: "Alle brukere" });
    const theme = screen.getByRole("button", { name: "Bruk mørkt tema" });

    expect(actions).toHaveAttribute("aria-busy", "true");
    expect(back).toBeDisabled();
    expect(theme).toBeDisabled();
    await fireEvent.click(back);
    expect(callbacks.onBack).not.toHaveBeenCalled();

    await result.rerender({ ...callbacks, pending: false });
    expect(screen.getByRole("button", { name: "Alle brukere" })).toBeEnabled();
  });

  it("reserves navigation geometry during loading", () => {
    const { result } = renderFixture();
    const loading = screen.getByRole("status", { name: "Laster navigasjon" });

    expect(loading).toHaveAttribute("data-layout", "sidebar");
    expect(loading.querySelectorAll('[data-part="item"]')).toHaveLength(3);
    expect(loading.querySelector('[data-part="list"]')).toHaveClass(
      "max-w-navigation-sidebar",
      "flex-col"
    );
    expect(loading.querySelector('[data-part="item"]')).toHaveClass(
      "min-h-navigation-loading-item",
      "bg-navigation-loading-placeholder",
      "animate-navigation-loading"
    );
    expect(result.container.querySelector('[data-ui="navigation-loading"]')).toBeInTheDocument();
  });

  it("has no detectable accessibility violations", async () => {
    const { result } = renderFixture();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });
});
