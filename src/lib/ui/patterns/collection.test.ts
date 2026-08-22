// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import CollectionEmpty from "./CollectionEmpty.svelte";
import CollectionError from "./CollectionError.svelte";
import CollectionFixture from "./CollectionFixture.test.svelte";
import CollectionLoading from "./CollectionLoading.svelte";
import CollectionRowInteractionsFixture from "./CollectionRowInteractionsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

describe("public collection anatomy", () => {
  it("owns the collection name, filter placement and refresh state", () => {
    render(CollectionFixture, {
      busy: true,
      onAction: () => undefined,
      onOpen: () => undefined,
    });

    const collection = screen.getByRole("region", { name: "3 arrangementer" });
    expect(collection).toHaveAttribute("data-ui", "collection");
    expect(collection).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("group", { name: "Arrangementfiltre" })).toContainElement(
      screen.getByRole("button", { name: "Kommende" })
    );
    expect(screen.getByRole("list", { name: "Arrangementer" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("button", { name: "Vis flere" }).closest("footer")).toHaveAttribute(
      "data-part",
      "footer"
    );
  });

  it("keeps each row in exactly one typed interaction mode", async () => {
    const onOpen = vi.fn();
    const onAction = vi.fn();
    const { container } = render(CollectionFixture, { onAction, onOpen });

    const rows = container.querySelectorAll('[data-ui="collection-row"]');
    expect([...rows].map((row) => row.getAttribute("data-interaction"))).toEqual([
      "static",
      "open",
      "action",
    ]);

    await fireEvent.click(screen.getByRole("button", { name: "Åpne Høstcup" }));
    await fireEvent.click(screen.getByRole("button", { name: "Les mer" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("gives date groups a visible heading and a labelled nested list", () => {
    render(CollectionFixture, {
      grouped: true,
      onAction: () => undefined,
      onOpen: () => undefined,
    });

    expect(
      screen.getByRole("heading", { level: 3, name: "I dag lørdag 22. august" })
    ).toBeVisible();
    expect(screen.getByRole("list", { name: "I dag lørdag 22. august" })).toContainElement(
      screen.getByText("Bane 1")
    );
    expect(screen.getByText("Ledig")).toHaveAttribute("data-tone", "available");
  });
});

describe("public collection states", () => {
  it("announces loading while reserving the requested row geometry", () => {
    const { container } = render(CollectionLoading, {
      label: "Laster bookinger",
      layout: "schedule",
      rows: 4,
    });

    expect(screen.getByRole("status", { name: "Laster bookinger" })).toHaveAttribute(
      "data-layout",
      "schedule"
    );
    expect(container.querySelectorAll('[data-part="row"]')).toHaveLength(4);
  });

  it("uses polite empty feedback and assertive retryable errors", async () => {
    const onRetry = vi.fn();
    const empty = render(CollectionEmpty, {
      description: "Når klubben publiserer noe, vises det her.",
      title: "Ingen nyheter akkurat nå",
    });

    expect(screen.getByRole("status")).toHaveTextContent("Ingen nyheter akkurat nå");
    empty.unmount();

    const error = render(CollectionError, {
      description: "Nettverket svarte ikke.",
      onRetry,
      title: "Kunne ikke laste arrangementene",
    });
    await fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(onRetry).toHaveBeenCalledOnce();
    error.unmount();
  });

  it("has no detectable accessibility violations in representative collection states", async () => {
    const rows = render(CollectionFixture, {
      onAction: () => undefined,
      onOpen: () => undefined,
    });
    expect((await axe.run(rows.container, axeOptions)).violations).toEqual([]);
    rows.unmount();

    const error = render(CollectionError, {
      onRetry: () => undefined,
      title: "Kunne ikke laste arrangementene",
    });
    expect((await axe.run(error.container, axeOptions)).violations).toEqual([]);
  });
});

describe("compound collection row interactions", () => {
  function renderInteractions(options: { busy?: boolean; value?: string } = {}) {
    return render(CollectionRowInteractionsFixture, {
      ...options,
      onDetailsAction: vi.fn(),
      onMoveDown: vi.fn(),
      onMoveUp: vi.fn(),
      onOpen: vi.fn(),
      onQuickAction: vi.fn(),
    });
  }

  it("keeps expansion on the summary while quick actions remain sibling controls", async () => {
    const onQuickAction = vi.fn();
    render(CollectionRowInteractionsFixture, {
      onDetailsAction: () => undefined,
      onMoveDown: () => undefined,
      onMoveUp: () => undefined,
      onOpen: () => undefined,
      onQuickAction,
      value: "",
    });

    const firstTrigger = screen.getByRole("button", { name: /Ada Lovelace/ });
    const secondTrigger = screen.getByRole("button", { name: /Bane 1/ });
    const quickAction = screen.getByRole("button", { name: "Book" });

    expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    expect(secondTrigger).toHaveAttribute("aria-expanded", "false");
    expect(quickAction).not.toBe(secondTrigger);

    await fireEvent.click(quickAction);
    expect(onQuickAction).toHaveBeenCalledOnce();
    expect(secondTrigger).toHaveAttribute("aria-expanded", "false");

    secondTrigger.focus();
    await fireEvent.click(secondTrigger);
    expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Banereglement og bookingvilkår.")).toBeVisible();
    expect(secondTrigger).toHaveFocus();
  });

  it("supports one controlled open row and accordion keyboard focus", async () => {
    renderInteractions({ value: "first" });

    const firstTrigger = screen.getByRole("button", { name: /Ada Lovelace/ });
    const secondTrigger = screen.getByRole("button", { name: /Bane 1/ });

    expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Medlemskap og sperrehistorikk.")).toBeVisible();

    firstTrigger.focus();
    await fireEvent.keyDown(firstTrigger, { key: "ArrowDown" });
    expect(secondTrigger).toHaveFocus();

    await fireEvent.keyDown(secondTrigger, { key: "Enter" });
    expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps open and reorder actions in document focus order with explicit disabled edges", async () => {
    const onMoveDown = vi.fn();
    const onOpen = vi.fn();
    render(CollectionRowInteractionsFixture, {
      onDetailsAction: () => undefined,
      onMoveDown,
      onMoveUp: () => undefined,
      onOpen,
      onQuickAction: () => undefined,
    });

    const open = screen.getByRole("button", { name: "Åpne Sentralbanen" });
    const moveUp = screen.getByRole("button", { name: "Flytt Sentralbanen opp" });
    const moveDown = screen.getByRole("button", { name: "Flytt Sentralbanen ned" });

    expect(screen.getByRole("group", { name: "Rekkefølge for Sentralbanen" })).toContainElement(
      moveDown
    );
    expect(moveUp).toBeDisabled();
    expect(moveDown).toBeEnabled();

    await fireEvent.click(open);
    await fireEvent.click(moveDown);
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onMoveDown).toHaveBeenCalledOnce();
  });

  it("disables every reorder target and exposes busy state while a move is pending", () => {
    const { container } = renderInteractions({ busy: true });
    const reorderRow = container.querySelector('[data-interaction="reorder"]');

    expect(reorderRow).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Åpne Sentralbanen" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Flytt Sentralbanen opp" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Flytt Sentralbanen ned" })).toBeDisabled();
  });

  it("has no detectable accessibility violations in expanded and reorder states", async () => {
    const rows = renderInteractions({ value: "first" });
    expect((await axe.run(rows.container, axeOptions)).violations).toEqual([]);
  });
});
