// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import SelectFixture from "./SelectFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas or app shell; contrast and the portal's landmark placement are browser QA.
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

function renderFixture(
  options: {
    disabled?: boolean;
    empty?: boolean;
    invalid?: boolean;
    pending?: boolean;
  } = {}
) {
  const onValueChange = vi.fn();
  const result = render(SelectFixture, { onValueChange, ...options });
  return { onValueChange, result };
}

describe("Select", () => {
  it("integrates placeholder, native form value and FormField accessibility", async () => {
    renderFixture({ invalid: true });

    const trigger = screen.getByRole("combobox", { name: "Bane" });
    expect(trigger).toHaveTextContent("Velg bane…");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelector('input[name="court"]')).toBeRequired();
    expect(trigger).toHaveAttribute("aria-required", "true");
    expect(trigger).toHaveAccessibleDescription(
      "Velg banen bookingen skal flyttes til. Du må velge en bane."
    );

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const listbox = await screen.findByRole("listbox", { hidden: true });
    expect(within(listbox).getAllByRole("option", { hidden: true })).toHaveLength(3);
    expect(within(listbox).getByRole("option", { name: "Bane C" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("opens, navigates with arrows, selects with Enter and returns focus", async () => {
    const { onValueChange } = renderFixture();
    const trigger = screen.getByRole("combobox", { name: "Bane" });
    trigger.focus();

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await screen.findByRole("listbox", { hidden: true });
    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await fireEvent.keyDown(trigger, { key: "Enter" });

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("court-b"));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent("Padelbane");
    expect(document.querySelector('input[name="court"]')).toHaveValue("court-b");
  });

  it("supports closed-list typeahead and Escape focus return", async () => {
    const { onValueChange } = renderFixture();
    const trigger = screen.getByRole("combobox", { name: "Bane" });
    trigger.focus();

    await fireEvent.keyDown(trigger, { key: "p" });
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("court-b"));

    await fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await screen.findByRole("listbox", { hidden: true });
    await fireEvent.keyDown(trigger, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("communicates an empty option list", async () => {
    renderFixture({ empty: true });
    await fireEvent.keyDown(screen.getByRole("combobox", { name: "Bane" }), {
      key: "ArrowDown",
    });

    expect(await screen.findByText("Ingen valg tilgjengelig")).toBeVisible();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("locks disabled and pending controls while preserving their semantics", () => {
    const disabled = renderFixture({ disabled: true });
    expect(screen.getByRole("combobox", { name: "Bane" })).toBeDisabled();
    disabled.result.unmount();

    renderFixture({ pending: true });
    const pending = screen.getByRole("combobox", { name: "Bane" });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
  });

  it("has no detectable accessibility violations when closed and open", async () => {
    renderFixture();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);

    await fireEvent.keyDown(screen.getByRole("combobox", { name: "Bane" }), {
      key: "ArrowDown",
    });
    await screen.findByRole("listbox", { hidden: true });
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });
});
