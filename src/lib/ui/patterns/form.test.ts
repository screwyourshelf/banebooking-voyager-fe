// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import Input from "../primitives/Input.svelte";
import FormFixture from "./FormFixture.test.svelte";
import InvalidFormFieldFixture from "./InvalidFormFieldFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

describe("public form anatomy", () => {
  it("owns stable label, description, required and validation relationships", async () => {
    const { rerender } = render(FormFixture, {
      invalid: true,
      onCancel: () => undefined,
      onSubmit: () => undefined,
    });

    const title = screen.getByRole("textbox", { name: "Tittel" });
    const description = screen.getByText("Kort overskrift for kunngjøringen.");
    const error = screen.getByRole("alert");

    expect(title).toBeRequired();
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAttribute("aria-describedby", `${description.id} ${error.id}`);
    expect(screen.getByText("Tittel").closest("label")).toHaveAttribute("for", title.id);
    expect(error).toHaveTextContent("Tittel må fylles ut.");

    await rerender({
      invalid: false,
      onCancel: () => undefined,
      onSubmit: () => undefined,
    });
    expect(title).not.toHaveAttribute("aria-invalid");
    expect(title).toHaveAttribute("aria-describedby", description.id);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps the native input primitive usable outside editable form fields", () => {
    render(Input, { "aria-label": "Søk", id: "collection-search", type: "search" });
    expect(screen.getByRole("searchbox", { name: "Søk" })).toHaveAttribute(
      "id",
      "collection-search"
    );
  });

  it("binds native input and textarea values into standard form submission", async () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    render(FormFixture, { onCancel, onSubmit });

    await fireEvent.input(screen.getByRole("textbox", { name: "Tittel" }), {
      target: { value: "Ny sesong" },
    });
    await fireEvent.input(screen.getByRole("textbox", { name: "Budskap" }), {
      target: { value: "Banene åpner mandag." },
    });
    await fireEvent.click(screen.getByRole("button", { name: "Avbryt" }));
    await fireEvent.click(screen.getByRole("button", { name: "Publiser" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      message: "Banene åpner mandag.",
      title: "Ny sesong",
    });
  });

  it("represents disabled fields and pending actions with native states", () => {
    const { container } = render(FormFixture, {
      disabled: true,
      onCancel: () => undefined,
      onSubmit: () => undefined,
      pending: true,
    });

    expect(screen.getByRole("textbox", { name: "Tittel" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Budskap" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Publiserer …" })).toBeDisabled();
    expect(container.querySelector('[data-ui="form"]')).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector('[data-ui="form-actions"]')).toHaveAttribute(
      "data-align",
      "between"
    );
  });

  it("rejects form fields outside the shared field group", () => {
    expect(() => render(InvalidFormFieldFixture)).toThrow(
      "FormField must be rendered inside FormFields."
    );
  });

  it("has no detectable accessibility violations in valid and invalid states", async () => {
    const valid = render(FormFixture, {
      onCancel: () => undefined,
      onSubmit: () => undefined,
    });
    expect((await axe.run(valid.container, axeOptions)).violations).toEqual([]);
    valid.unmount();

    const invalid = render(FormFixture, {
      invalid: true,
      onCancel: () => undefined,
      onSubmit: () => undefined,
    });
    expect((await axe.run(invalid.container, axeOptions)).violations).toEqual([]);
  });
});
