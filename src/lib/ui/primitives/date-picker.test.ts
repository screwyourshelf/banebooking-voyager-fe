// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import DatePickerFixture from "./DatePickerFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas or final app shell; contrast and portal landmarks are browser QA.
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};

function renderFixture(options: { disabled?: boolean; invalid?: boolean; pending?: boolean } = {}) {
  const onDateChange = vi.fn();
  const onDatesChange = vi.fn();
  const result = render(DatePickerFixture, { onDateChange, onDatesChange, ...options });
  return { onDateChange, onDatesChange, result };
}

function getStartDateTrigger() {
  return screen.getByRole("button", { name: "Startdato" });
}

describe("DatePicker and MultiDatePicker", () => {
  it("integrates ISO values, native form data and FormField accessibility", () => {
    renderFixture({ invalid: true });

    const trigger = getStartDateTrigger();
    expect(trigger).toHaveTextContent("Lør. 22. august");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription(
      "Velg en dato i august. Datoen er ikke gyldig. Obligatorisk felt."
    );

    const form = screen.getByRole("form", { name: "Datofelter" }) as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get("startDate")).toBe("2026-08-22");
    expect(data.getAll("dates")).toEqual(["2026-08-22", "2026-08-24"]);
    expect(form.querySelector('input[name="startDate"]')).toHaveAttribute("required");

    const bookingTrigger = screen.getByRole("button", { name: "Bookingdato" });
    expect(bookingTrigger).toHaveTextContent("25. aug.");
    expect(bookingTrigger).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("button", { name: "Statistikk fra" })).toHaveTextContent(
      "1. jan. 2026"
    );
  });

  it("opens a Norwegian calendar with keyboard-focusable min and max boundaries", async () => {
    renderFixture();
    await fireEvent.click(getStartDateTrigger());

    const calendar = await screen.findByLabelText(/Velg startdato/i);
    expect(
      within(calendar).getByRole("heading", { name: /Velg startdato august 2026/i })
    ).toBeInTheDocument();
    expect(within(calendar).getByText("man.")).toBeVisible();
    expect(
      within(calendar).getByRole("button", { name: /onsdag 19. august 2026/i })
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      within(calendar).getByRole("button", { name: /torsdag 20. august 2026/i })
    ).toHaveAttribute("aria-disabled", "false");

    await fireEvent.click(within(calendar).getByRole("button", { name: "Neste måned" }));
    await waitFor(() =>
      expect(
        within(calendar).getByRole("heading", { name: /Velg startdato september 2026/i })
      ).toBeInTheDocument()
    );
    expect(
      within(calendar).getByRole("button", { name: /lørdag 5. september 2026/i })
    ).toHaveAttribute("aria-disabled", "false");
    expect(
      within(calendar).getByRole("button", { name: /søndag 6. september 2026/i })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("selects with the arrow keys and Enter, closes and returns focus to the trigger", async () => {
    const { onDateChange } = renderFixture();
    const trigger = getStartDateTrigger();
    await fireEvent.click(trigger);

    await screen.findByRole("button", {
      name: /lørdag 22. august 2026/i,
    });
    await waitFor(() => expect(document.activeElement).toHaveAttribute("data-value", "2026-08-22"));
    await fireEvent.keyDown(document.activeElement ?? document.body, { key: "ArrowRight" });
    await fireEvent.keyDown(document.activeElement ?? document.body, { key: "Enter" });

    await waitFor(() => expect(onDateChange).toHaveBeenCalledWith("2026-08-23"));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent("Søn. 23. august");
  });

  it("closes with Escape and returns focus without changing the value", async () => {
    const { onDateChange } = renderFixture();
    const trigger = getStartDateTrigger();
    trigger.focus();
    await fireEvent.click(trigger);
    await screen.findByLabelText(/Velg startdato/i);
    await fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    await waitFor(() => expect(screen.queryByLabelText(/Velg startdato/i)).toBeNull());
    expect(trigger).toHaveFocus();
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it("keeps day navigation inside min and max boundaries", async () => {
    const { onDateChange } = renderFixture();
    const previous = screen.getByRole("button", { name: "Forrige dag" });
    const next = screen.getByRole("button", { name: "Neste dag" });

    expect(previous).not.toBeDisabled();
    await fireEvent.click(previous);
    expect(onDateChange).toHaveBeenLastCalledWith("2026-08-21");
    await fireEvent.click(previous);
    expect(onDateChange).toHaveBeenLastCalledWith("2026-08-20");
    expect(previous).toBeDisabled();

    await fireEvent.click(next);
    expect(onDateChange).toHaveBeenLastCalledWith("2026-08-21");
  });

  it("toggles multiple ISO dates and preserves repeated native form values", async () => {
    const { onDatesChange } = renderFixture();
    const calendar = screen.getByLabelText(/Velg bookingdatoer/i);
    const day = within(calendar).getByRole("button", { name: /søndag 23. august 2026/i });
    await fireEvent.click(day);

    await waitFor(() =>
      expect(onDatesChange).toHaveBeenCalledWith(["2026-08-22", "2026-08-23", "2026-08-24"])
    );
    expect(day).toHaveAttribute("data-selected");

    const form = screen.getByRole("form", { name: "Datofelter" }) as HTMLFormElement;
    expect(new FormData(form).getAll("dates")).toEqual(["2026-08-22", "2026-08-23", "2026-08-24"]);
  });

  it("locks disabled and pending date controls without losing busy state", () => {
    const disabled = renderFixture({ disabled: true });
    expect(getStartDateTrigger()).toBeDisabled();
    expect(screen.getByRole("group", { name: "Bookingdatoer" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    disabled.result.unmount();

    renderFixture({ pending: true });
    expect(getStartDateTrigger()).toBeDisabled();
    expect(getStartDateTrigger()).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("group", { name: "Bookingdatoer" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("has no detectable accessibility violations when inline, closed and open", async () => {
    renderFixture();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);

    await fireEvent.click(getStartDateTrigger());
    await screen.findByLabelText(/Velg startdato/i);
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });
});
