// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import PrimitiveControlsFixture from "./PrimitiveControlsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified by the browser matrix.
  rules: { "color-contrast": { enabled: false } },
};

describe("base action and text-control primitives", () => {
  it("maps typed action variants and sizes to the semantic Tailwind vocabulary", () => {
    render(PrimitiveControlsFixture);

    expect(screen.getByRole("button", { name: "Primær" })).toHaveClass(
      "bg-brand",
      "text-action-primary-text",
      "px-action-inline"
    );
    expect(screen.getByRole("button", { name: "Sekundær" })).toHaveClass(
      "bg-action-secondary",
      "text-caption",
      "min-h-compact-control"
    );
    expect(screen.getByRole("button", { name: "Destruktiv" })).toHaveClass(
      "bg-status-danger-bg",
      "text-status-danger-text"
    );
    expect(screen.getByRole("button", { name: "Diskré" })).toHaveClass(
      "bg-transparent",
      "text-ink",
      "w-full"
    );
    expect(screen.getByRole("button", { name: "Ikonhandling" })).toHaveClass("w-control", "p-0");
    expect(screen.getByRole("button", { name: "Kompakt ikonhandling" })).toHaveClass(
      "w-compact-control",
      "h-compact-control"
    );
    expect(screen.getByRole("link", { name: "Fortsett" })).toHaveClass(
      "bg-brand",
      "text-action-primary-text"
    );
  });

  it("keeps icon geometry, native values and form data explicit", () => {
    const { container } = render(PrimitiveControlsFixture);
    const icon = screen.getByRole("button", { name: "Ikonhandling" }).querySelector("svg");
    const form = screen.getByRole("form", { name: "Primitive skjemakontroller" });
    expect(form).toBeInstanceOf(HTMLFormElement);
    const formData = new FormData(form as HTMLFormElement);

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("width", "20");
    expect(icon).toHaveAttribute("height", "20");
    expect(screen.getByRole("textbox", { name: "Tittel" })).toHaveValue("Ny sesong");
    expect(screen.getByRole("textbox", { name: "Budskap" })).toHaveValue("Åpner mandag");
    expect(formData.get("title")).toBe("Ny sesong");
    expect(formData.get("message")).toBe("Åpner mandag");
    expect(container.querySelector('[data-ui-primitive="textarea"]')).toHaveClass(
      "min-h-textarea",
      "rounded-textarea"
    );
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(PrimitiveControlsFixture);
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
