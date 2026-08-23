// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import RichTextEditorFixture from "./RichTextEditorFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom cannot calculate final theme contrast.
  rules: { "color-contrast": { enabled: false } },
};

function renderFixture(
  options: {
    disabled?: boolean;
    invalid?: boolean;
    pending?: boolean;
    value?: string;
  } = {}
) {
  const onError = vi.fn();
  const onValueChange = vi.fn();
  const result = render(RichTextEditorFixture, { onError, onValueChange, ...options });
  return { onError, onValueChange, result };
}

async function getEditor() {
  return await screen.findByRole("textbox", { name: "Presentasjon på nettsiden" });
}

describe("RichTextEditor", () => {
  it("loads persisted Tiptap JSON and inherits the FormField contract", async () => {
    renderFixture({ invalid: true });

    expect(screen.getByRole("status")).toHaveTextContent("Laster teksteditor");
    const editor = await getEditor();

    expect(editor).toHaveTextContent("Velkommen");
    expect(editor).toHaveAttribute("contenteditable", "true");
    expect(editor).toHaveAttribute("aria-invalid", "true");
    expect(editor).toHaveAccessibleDescription(
      "Formater teksten som skal publiseres. Presentasjonen er ikke gyldig."
    );
    expect(editor).toHaveAttribute("aria-required", "true");

    const form = screen.getByRole("form", { name: "Arrangementpresentasjon" }) as HTMLFormElement;
    const storedValue = new FormData(form).get("nettsideBeskrivelse");
    expect(storedValue).toBeTypeOf("string");
    expect(JSON.parse(String(storedValue))).toMatchObject({ type: "doc" });
  });

  it("supports toolbar formatting, keyboard shortcuts and focus return", async () => {
    renderFixture();
    const editor = await getEditor();
    const toolbar = screen.getByRole("toolbar", { name: "Formatering" });
    const bold = within(toolbar).getByRole("button", { name: "Fet" });

    editor.focus();
    await fireEvent.keyDown(editor, { ctrlKey: true, key: "b" });
    await waitFor(() => expect(bold).toHaveAttribute("aria-pressed", "true"));

    await fireEvent.click(within(toolbar).getByRole("button", { name: "Kursiv" }));
    expect(editor).toHaveFocus();
    expect(within(toolbar).getByRole("button", { name: "Kursiv" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("serializes table commands through the bindable JSON boundary", async () => {
    const { onValueChange } = renderFixture();
    await getEditor();
    const toolbar = screen.getByRole("toolbar", { name: "Formatering" });

    await fireEvent.click(within(toolbar).getByRole("button", { name: "Sett inn tabell" }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    const insertedValue = onValueChange.mock.calls.at(-1)?.[0] as string;
    expect(JSON.parse(insertedValue)).toMatchObject({
      type: "doc",
      content: expect.arrayContaining([expect.objectContaining({ type: "table" })]),
    });

    expect(within(toolbar).getByRole("button", { name: "Legg til kolonne" })).toBeEnabled();
    expect(within(toolbar).getByRole("button", { name: "Legg til rad" })).toBeEnabled();
    await fireEvent.click(within(toolbar).getAllByRole("button", { name: "Slett tabell" }).at(-1)!);
    await waitFor(() => {
      const value = onValueChange.mock.calls.at(-1)?.[0] as string;
      expect(value).not.toContain('"type":"table"');
    });
  });

  it("serializes an editor emptied through commands as the public empty string", async () => {
    const { onValueChange } = renderFixture({ value: "" });
    await getEditor();
    const toolbar = screen.getByRole("toolbar", { name: "Formatering" });

    await fireEvent.click(within(toolbar).getByRole("button", { name: "Sett inn tabell" }));
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    await fireEvent.click(within(toolbar).getAllByRole("button", { name: "Slett tabell" }).at(-1)!);

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(""));
  });

  it("applies controlled external updates without emitting a competing change", async () => {
    const { onValueChange } = renderFixture();
    const editor = await getEditor();
    onValueChange.mockClear();

    await fireEvent.click(screen.getByRole("button", { name: "Last ekstern verdi" }));

    await waitFor(() => expect(editor).toHaveTextContent("Oppdatert presentasjon"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("locks disabled and pending editors while preserving content and busy state", async () => {
    const disabled = renderFixture({ disabled: true });
    expect(await getEditor()).toHaveAttribute("contenteditable", "false");
    expect(screen.getByRole("button", { name: "Fet" })).toBeDisabled();
    disabled.result.unmount();

    renderFixture({ pending: true });
    const pendingEditor = await getEditor();
    expect(pendingEditor).toHaveAttribute("contenteditable", "false");
    expect(pendingEditor.closest('[data-ui="editor"]')).toHaveAttribute("aria-busy", "true");
    expect(pendingEditor).toHaveTextContent("Velkommen");
  });

  it("contains invalid persisted content behind a fail-closed error boundary", async () => {
    const { onError } = renderFixture({ value: "{not-json" });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Teksteditoren kunne ikke åpnes");
    expect(alert).toHaveTextContent("har et format editoren ikke kan lese");
    expect(within(alert).queryByRole("button", { name: "Prøv igjen" })).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("has no detectable accessibility violations while loading, ready and locked", async () => {
    const ready = renderFixture();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
    await getEditor();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
    ready.result.unmount();

    renderFixture({ pending: true });
    await getEditor();
    expect((await axe.run(document.body, axeOptions)).violations).toEqual([]);
  });
});
