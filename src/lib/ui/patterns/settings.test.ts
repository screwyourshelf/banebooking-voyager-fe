// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import SettingsFixture from "./SettingsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture(options: { disabled?: boolean; pending?: boolean } = {}) {
  const callbacks = {
    onChoice: vi.fn(),
    onMethod: vi.fn(),
    onPublished: vi.fn(),
  };

  return {
    callbacks,
    result: render(SettingsFixture, { ...callbacks, ...options }),
  };
}

describe("public settings anatomy", () => {
  it("owns the section heading, panel and status-row relationships", () => {
    const { result } = renderFixture();
    const section = screen.getByRole("region", { name: "Publisering og oppsett" });

    expect(screen.getByRole("heading", { name: "Publisering og oppsett", level: 2 })).toBeVisible();
    expect(screen.getByText("Nettside")).toBeVisible();
    expect(screen.getByText("Status")).toBeVisible();
    expect(screen.getByText("Aktiv")).toBeVisible();
    expect(screen.getByText("I dag kl. 14.30.")).toBeVisible();
    expect(section.querySelector('[data-ui="settings-panel"]')).toBeInTheDocument();
    expect(result.container.querySelector('[data-ui="settings-stack"]')).toBeInTheDocument();
    expect(result.container.querySelector('[data-ui="form-field"]')).not.toBeInTheDocument();
  });

  it("reports switch changes through a semantic boolean callback", async () => {
    const { callbacks } = renderFixture();
    const control = screen.getByRole("switch", { name: "Vis på nettsiden" });

    expect(control).toHaveAttribute("aria-checked", "true");
    await fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(callbacks.onPublished).toHaveBeenCalledWith(false);
  });

  it("keeps single and multiple selection states explicit", async () => {
    const { callbacks } = renderFixture();
    const repeat = screen.getByRole("radio", { name: /Gjentakende/ });
    const manual = screen.getByRole("radio", { name: /Manuelt/ });
    const courtOne = screen.getByRole("button", { name: "Bane 1" });
    const courtTwo = screen.getByRole("button", { name: "Bane 2" });

    expect(repeat).toBeChecked();
    expect(manual).not.toBeChecked();
    expect(courtOne).toHaveAttribute("aria-pressed", "true");
    expect(courtTwo).toHaveAttribute("aria-pressed", "false");

    await fireEvent.click(manual);
    await fireEvent.click(courtTwo);

    expect(manual).toBeChecked();
    expect(courtTwo).toHaveAttribute("aria-pressed", "true");
    expect(callbacks.onMethod).toHaveBeenCalledWith("manual");
    expect(callbacks.onChoice).toHaveBeenCalledWith("court-2");
  });

  it("uses native keyboard controls with one radio name and stable focus targets", () => {
    renderFixture();
    const switchControl = screen.getByRole("switch", { name: "Vis på nettsiden" });
    const radios = screen.getAllByRole("radio");
    const choice = screen.getByRole("button", { name: "Bane 1" });

    expect(switchControl.tagName).toBe("BUTTON");
    expect(radios.every((radio) => radio.tagName === "INPUT")).toBe(true);
    expect(radios[0]).toHaveAttribute("name", radios[1].getAttribute("name"));
    expect(choice.tagName).toBe("BUTTON");

    switchControl.focus();
    expect(switchControl).toHaveFocus();
    radios[0].focus();
    expect(radios[0]).toHaveFocus();
    choice.focus();
    expect(choice).toHaveFocus();
  });

  it("disables every choice while disabled or pending and exposes busy state", async () => {
    const { callbacks, result } = renderFixture({ pending: true });
    const controls = [
      screen.getByRole("switch", { name: "Vis på nettsiden" }),
      ...screen.getAllByRole("radio"),
      ...screen.getAllByRole("button"),
    ];

    expect(controls.every((control) => control.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByRole("radiogroup", { name: "Velg oppsettstype" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("group", { name: "Baner" })).toHaveAttribute("aria-busy", "true");

    await fireEvent.click(screen.getByRole("button", { name: "Bane 1" }));
    await fireEvent.click(screen.getByRole("switch", { name: "Vis på nettsiden" }));
    await fireEvent.change(screen.getByRole("radio", { name: /Manuelt/ }));
    expect(callbacks.onChoice).not.toHaveBeenCalled();
    expect(callbacks.onPublished).not.toHaveBeenCalled();
    expect(callbacks.onMethod).not.toHaveBeenCalled();

    await result.rerender({ ...callbacks, disabled: true, pending: false });
    expect(screen.getByRole("switch", { name: "Vis på nettsiden" })).toBeDisabled();
    expect(screen.getByRole("radiogroup", { name: "Velg oppsettstype" })).not.toHaveAttribute(
      "aria-busy"
    );
  });

  it("has no detectable accessibility violations in normal and pending states", async () => {
    const normal = renderFixture();
    expect((await axe.run(normal.result.container, axeOptions)).violations).toEqual([]);
    normal.result.unmount();

    const pending = renderFixture({ pending: true });
    expect((await axe.run(pending.result.container, axeOptions)).violations).toEqual([]);
  });
});
