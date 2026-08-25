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

  it("owns responsive frame, sidebar, mobile surface and safe-area geometry", () => {
    const { container } = render(AppShellFixture, { onTheme: () => undefined });
    const shell = container.querySelector('[data-ui="app-shell"]');
    const frame = container.querySelector('[data-part="frame"]');
    const sidebar = container.querySelector('[data-part="sidebar"]');
    const workspace = container.querySelector('[data-part="workspace"]');
    const topbar = container.querySelector('[data-part="topbar"]');
    const main = screen.getByRole("main");
    const bottom = container.querySelector('[data-part="bottom-navigation"]');

    expect(shell).toHaveClass("min-h-app-shell", "bg-canvas", "md:bg-app-shell-court");
    expect(frame).toHaveClass(
      "md:grid",
      "md:grid-cols-app-shell",
      "md:isolate",
      "md:bg-sidebar",
      "md:before:bg-app-shell-desktop-backdrop",
      "lg:bg-transparent"
    );
    expect(sidebar).toHaveClass(
      "hidden",
      "md:flex",
      "md:flex-col",
      "md:h-app-shell",
      "md:border-r-sidebar-divider-width",
      "md:bg-app-shell-sidebar",
      "md:py-app-shell-sidebar-block",
      "md:shadow-app-shell-sidebar",
      "lg:bg-app-shell-sidebar-desktop",
      "lg:shadow-app-shell-sidebar-desktop"
    );
    expect(sidebar).not.toHaveClass("lg:block");
    expect(workspace).toHaveClass(
      "flex",
      "min-h-app-shell",
      "pb-app-shell-workspace-safe",
      "md:bg-transparent",
      "md:pb-0",
      "md:shadow-none",
      "lg:isolate"
    );
    expect(topbar).toHaveClass(
      "sticky",
      "min-h-app-shell-topbar",
      "pt-app-shell-topbar-safe",
      "backdrop-blur-app-shell-topbar",
      "md:hidden",
      "app-shell-topbar-identity:flex-1",
      "app-shell-topbar-actions:flex-none"
    );
    expect(main).toHaveClass(
      "max-w-content",
      "bg-app-shell-main",
      "pb-app-shell-main-safe",
      "md:bg-transparent",
      "md:pb-0",
      "lg:relative"
    );
    expect(bottom).toHaveClass("fixed", "z-40", "inset-x-0", "bottom-0", "md:hidden");
  });

  it("provides Page and tenant identity with their responsive shell theme", () => {
    render(AppShellFixture, { onTheme: () => undefined });
    const desktop = screen.getByRole("navigation", { name: "Hovednavigasjon" });
    const identity = within(desktop).getByRole("link", { name: /Fjordvik Tennisklubb/ });
    const title = screen.getByRole("heading", { level: 1, name: "Klubboversikt" });

    expect(identity).toHaveClass("text-sidebar-text");
    expect(within(identity).getByText("Banebooking")).toHaveClass("text-control-muted");
    expect(title).toHaveClass(
      "text-page-heading",
      "md:text-page-shell-heading",
      "lg:text-shadow-page-shell"
    );
    expect(screen.getByText("Velkommen til Fjordvik Tennisklubb.")).toHaveClass(
      "text-page-description",
      "md:text-page-shell-description"
    );
  });

  it("keeps the canvas background free of the optional desktop court image", () => {
    const { container } = render(AppShellLoadingFixture, { background: "canvas" });
    const shell = container.querySelector('[data-ui="app-shell"]');

    expect(shell).toHaveAttribute("data-background", "canvas");
    expect(shell).toHaveClass("bg-canvas");
    expect(shell).not.toHaveClass("md:bg-app-shell-court");
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
    expect(container.querySelector('[data-part="topbar-loading"]')).toHaveClass(
      "gap-app-shell-loading"
    );
    expect(
      container.querySelector('[data-part="topbar-loading"] > [data-part="identity"]')
    ).toHaveClass(
      "h-app-shell-loading",
      "w-app-shell-loading-identity",
      "rounded-app-shell-loading",
      "bg-app-shell-loading-placeholder",
      "animate-navigation-loading"
    );
    expect(
      container.querySelector('[data-part="topbar-loading"] > [data-part="action"]')
    ).toHaveClass("w-app-shell-loading-action", "flex-none");
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
