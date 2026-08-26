// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import ChoiceControlsFixture from "./ChoiceControlsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified by the browser matrix.
  rules: { "color-contrast": { enabled: false } },
};

describe("choice and accordion primitives", () => {
  it("maps selection, checked and disabled states to the semantic Tailwind vocabulary", async () => {
    const { container } = render(ChoiceControlsFixture);
    const choice = screen.getByRole("button", { name: "Bane 1" });
    const choiceIndicator = choice.querySelector('[data-part="indicator"]');
    const switchControl = screen.getByRole("switch", { name: "Publisert" });
    const switchThumb = switchControl.querySelector('[data-part="thumb"]');
    const repeat = screen.getByRole("radio", { name: "Gjentakende" });

    expect(choice).toHaveClass(
      "min-h-choice",
      "border-choice-selected-border",
      "bg-choice-selected-surface",
      "text-choice-selected-text"
    );
    expect(choiceIndicator).toHaveClass("bg-choice-indicator");
    expect(switchControl).toHaveClass("w-switch", "h-switch", "bg-switch-track");
    expect(switchThumb).toHaveClass("translate-x-0", "shadow-switch-thumb");
    expect(repeat).toHaveClass(
      "appearance-none",
      "checked:border-radio-selected",
      "checked:border-selection-indicator"
    );

    await fireEvent.click(choice);
    await fireEvent.click(switchControl);

    expect(choice).toHaveAttribute("aria-pressed", "false");
    expect(choice).toHaveClass("border-choice-border", "bg-choice-surface", "text-choice-text");
    expect(choiceIndicator).toHaveClass("bg-transparent");
    expect(switchControl).toHaveAttribute("aria-checked", "true");
    expect(switchControl).toHaveClass("bg-selection-indicator");
    expect(switchThumb).toHaveClass("translate-x-switch-thumb-shift");
    expect(screen.getByRole("button", { name: "Låst valg" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Låst publisering" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Deaktivert" })).toBeDisabled();
    expect(container.querySelector('[data-ui-primitive="accordion-list"]')).toHaveClass("min-w-0");
    expect(container.querySelector('[data-ui-primitive="accordion-row"]')).toHaveClass("min-w-0");
  });

  it("keeps native radio form data and accordion keyboard state explicit", async () => {
    render(ChoiceControlsFixture);
    const form = screen.getByRole("form", { name: "Valgprimitives" });
    const repeat = screen.getByRole("radio", { name: "Gjentakende" });
    const manual = screen.getByRole("radio", { name: "Manuelt" });
    const firstTrigger = screen.getByRole("button", { name: "Første rad" });
    const secondTrigger = screen.getByRole("button", { name: "Andre rad" });

    expect(new FormData(form as HTMLFormElement).get("method")).toBe("repeat");
    await fireEvent.click(manual);
    expect(repeat).not.toBeChecked();
    expect(manual).toBeChecked();
    expect(new FormData(form as HTMLFormElement).get("method")).toBe("manual");

    firstTrigger.focus();
    await fireEvent.keyDown(firstTrigger, { key: "ArrowDown" });
    expect(secondTrigger).toHaveFocus();
    await fireEvent.keyDown(secondTrigger, { key: "Enter" });
    expect(secondTrigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Andre detalj.")).toBeVisible();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(ChoiceControlsFixture);
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
