// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import DialogFixture from "./DialogFixture.test.svelte";

vi.mock("tabbable", () => {
  function controls(container: HTMLElement) {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
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
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture(options: { pending?: boolean } = {}) {
  const callbacks = {
    onEditorClose: vi.fn(),
    onSave: vi.fn(),
    onStandardClose: vi.fn(),
  };

  return {
    callbacks,
    result: render(DialogFixture, { ...callbacks, ...options }),
  };
}

async function openStandardDialog() {
  const trigger = screen.getByRole("button", { name: "Vis bookingregler" });
  trigger.focus();
  await fireEvent.click(trigger);
  return { dialog: await screen.findByRole("dialog", { name: "Bookingregler" }), trigger };
}

async function openEditorDialog() {
  const trigger = screen.getByRole("button", { name: "Rediger bruker" });
  trigger.focus();
  await fireEvent.click(trigger);
  return { dialog: await screen.findByRole("dialog", { name: "Rediger bruker" }), trigger };
}

async function waitForDismissibleLayer() {
  await new Promise((resolve) => setTimeout(resolve, 20));
}

afterEach(() => {
  document.body.focus();
});

describe("public dialog contracts", () => {
  it("owns the standard and editor anatomy without leaking it to consumers", async () => {
    renderFixture();

    const standard = await openStandardDialog();
    expect(standard.dialog).toHaveAttribute("data-size", "standard");
    expect(standard.dialog).toHaveAttribute("data-placement", "center");
    expect(standard.dialog).toHaveClass(
      "top-dialog-surface-top",
      "bottom-dialog-surface-bottom",
      "w-dialog-surface",
      "max-h-dialog-surface",
      "border-b-dialog-surface",
      "rounded-dialog-surface"
    );
    expect(document.querySelector('[data-ui-primitive="dialog-overlay"]')).toHaveClass(
      "bg-dialog-overlay",
      "backdrop-blur-dialog-overlay"
    );
    expect(standard.dialog.querySelector('[data-ui="dialog"]')).toHaveClass(
      "rounded-dialog",
      "bg-surface",
      "p-0"
    );
    expect(standard.dialog.querySelector('[data-part="header"]')).toHaveClass(
      "gap-lg",
      "px-dialog-inline",
      "pt-dialog-inline",
      "dialog-close:text-dialog-close"
    );
    expect(screen.getByRole("heading", { name: "Bookingregler", level: 2 })).toBeVisible();
    expect(screen.getByText(/Grenser, tider og varighet/)).toBeVisible();
    expect(within(standard.dialog).queryByRole("banner")).toBeNull();
    expect(within(standard.dialog).queryByRole("contentinfo")).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Lukk dialog" }));

    const editor = await openEditorDialog();
    expect(editor.dialog).toHaveAttribute("data-size", "editor");
    expect(editor.dialog).toHaveClass(
      "inset-0",
      "w-screen",
      "h-dvh",
      "md:w-editor-dialog",
      "md:h-editor-dialog",
      "md:rounded-dialog"
    );
    expect(editor.dialog.querySelector('[data-ui="editor-dialog"]')).toHaveClass(
      "h-full",
      "rounded-none",
      "bg-surface-subtle",
      "md:rounded-dialog"
    );
    expect(editor.dialog.querySelector('[data-part="header"]')).toHaveClass(
      "bg-editor-dialog-header",
      "pt-editor-dialog-safe",
      "editor-dialog-back:text-control-muted"
    );
    expect(editor.dialog.querySelector('[data-part="content"]')).toHaveClass(
      "overscroll-contain",
      "editor-dialog-tabs:p-md",
      "editor-dialog-actions:sticky"
    );
    expect(screen.getByText("Bruker")).toBeVisible();
    expect(screen.getByRole("button", { name: "Alle brukere" })).toBeVisible();
    expect(within(editor.dialog).queryByRole("banner")).toBeNull();
  });

  it("traps and loops focus inside the standard dialog", async () => {
    renderFixture();
    const { dialog } = await openStandardDialog();
    const first = screen.getByRole("button", { name: "Lukk dialog" });
    const last = screen.getByRole("button", { name: "Lagre" });

    await waitFor(() => expect(first).toHaveFocus());

    last.focus();
    await fireEvent.keyDown(dialog, { key: "Tab" });
    expect(first).toHaveFocus();

    await fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();

    screen.getByRole("button", { name: "Rediger bruker" }).focus();
    expect(last).toHaveFocus();
  });

  it("closes on Escape and returns focus to the opening control", async () => {
    const { callbacks } = renderFixture();
    const { dialog, trigger } = await openStandardDialog();
    await waitFor(() => expect(screen.getByRole("button", { name: "Lukk dialog" })).toHaveFocus());

    await fireEvent.keyDown(dialog, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Bookingregler" })).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(callbacks.onStandardClose).toHaveBeenCalledOnce();
  });

  it("closes on an outside interaction and reports one semantic close", async () => {
    const { callbacks } = renderFixture();
    await openStandardDialog();
    await waitForDismissibleLayer();

    await fireEvent.pointerDown(document.body, {
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerType: "mouse",
    });

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Bookingregler" })).toBeNull());
    expect(callbacks.onStandardClose).toHaveBeenCalledOnce();
  });

  it("blocks every dismissal path in both variants while pending", async () => {
    const { callbacks, result } = renderFixture({ pending: true });
    const standard = await openStandardDialog();

    expect(standard.dialog).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Lukk dialog" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Avbryt" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Lagre" })).toBeDisabled();

    await fireEvent.keyDown(standard.dialog, { key: "Escape" });
    await waitForDismissibleLayer();
    await fireEvent.pointerDown(document.body, {
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerType: "mouse",
    });
    expect(screen.getByRole("dialog", { name: "Bookingregler" })).toBeVisible();
    expect(callbacks.onStandardClose).not.toHaveBeenCalled();

    await result.rerender({ ...callbacks, pending: false });
    await fireEvent.click(screen.getByRole("button", { name: "Lukk dialog" }));
    await result.rerender({ ...callbacks, pending: true });

    const { dialog } = await openEditorDialog();
    const back = screen.getByRole("button", { name: "Alle brukere" });

    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(back).toBeDisabled();
    expect(screen.getByRole("button", { name: "Lagre bruker" })).toBeDisabled();

    await fireEvent.keyDown(dialog, { key: "Escape" });
    await waitForDismissibleLayer();
    await fireEvent.pointerDown(document.body, {
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerType: "mouse",
    });
    await fireEvent.click(back);

    expect(screen.getByRole("dialog", { name: "Rediger bruker" })).toBeVisible();
    expect(callbacks.onEditorClose).not.toHaveBeenCalled();
  });

  it("uses semantic action and close callbacks", async () => {
    const { callbacks } = renderFixture();
    await openStandardDialog();

    await fireEvent.click(screen.getByRole("button", { name: "Lagre" }));
    expect(callbacks.onSave).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: "Bookingregler" })).toBeVisible();

    await fireEvent.click(screen.getByRole("button", { name: "Avbryt" }));
    expect(callbacks.onStandardClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Bookingregler" })).toBeNull();
  });

  it("has no detectable accessibility violations in both variants", async () => {
    const standard = renderFixture();
    await openStandardDialog();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
    standard.result.unmount();

    renderFixture();
    await openEditorDialog();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });
});
