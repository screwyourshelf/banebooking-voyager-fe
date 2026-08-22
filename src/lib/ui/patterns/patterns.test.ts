// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import ErrorState from "./ErrorState.svelte";
import Feedback from "./Feedback.svelte";
import Page from "./Page.svelte";
import PageLoading from "./PageLoading.svelte";
import Section from "./Section.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

describe("public page and section patterns", () => {
  it("owns the standalone page landmark and heading hierarchy", () => {
    render(Page, {
      description: "Administrer klubbens baner.",
      eyebrow: "Administrasjon",
      standalone: true,
      title: "Baner",
    });

    expect(screen.getByRole("main")).toHaveAttribute("data-ui", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Baner" })).toBeInTheDocument();
    expect(screen.getByText("Administrer klubbens baner.")).toHaveAttribute(
      "data-part",
      "description"
    );
  });

  it("gives titled sections an accessible name and central variants", () => {
    render(Section, {
      description: "Aktive baner i klubben.",
      padding: "large",
      title: "Tilgjengelige baner",
      variant: "surface",
    });

    const section = screen.getByRole("region", { name: "Tilgjengelige baner" });
    expect(section).toHaveAttribute("data-variant", "surface");
    expect(section).toHaveAttribute("data-padding", "lg");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Tilgjengelige baner");
  });
});

describe("public loading, feedback and error patterns", () => {
  it("announces page loading while reserving representative content geometry", () => {
    const { container } = render(PageLoading, {
      label: "Kontrollerer tilgangen …",
      standalone: true,
    });

    expect(screen.getByRole("status")).toHaveTextContent("Kontrollerer tilgangen …");
    expect(screen.getByRole("main")).toContainElement(
      container.querySelector('[data-part="surface"]')
    );
  });

  it("uses assertive feedback only for danger states", () => {
    const { rerender } = render(Feedback, {
      description: "Prøv på nytt før du fortsetter.",
      title: "Innholdet kunne ikke lastes",
      tone: "danger",
    });

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");

    rerender({ title: "Endringene er lagret", tone: "success" });
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps retry behavior and pending copy inside the shared error contract", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(ErrorState, {
      onRetry,
      title: "Brukerdata kunne ikke lastes",
    });

    await fireEvent.click(screen.getByRole("button", { name: "Prøv igjen" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender({ isRetrying: true, onRetry, title: "Brukerdata kunne ikke lastes" });
    expect(screen.getByRole("button", { name: "Prøver igjen …" })).toBeDisabled();
  });

  it("has no detectable accessibility violations in representative states", async () => {
    const page = render(Page, {
      description: "Kontroller tilgangen og prøv igjen.",
      eyebrow: "Tilgang",
      standalone: true,
      title: "Kunne ikke kontrollere tilgangen",
    });
    expect((await axe.run(page.container, axeOptions)).violations).toEqual([]);
    page.unmount();

    const error = render(ErrorState, {
      description: "Prøv på nytt før du fortsetter.",
      onRetry: () => undefined,
      title: "Brukerdata kunne ikke lastes",
    });
    expect((await axe.run(error.container, axeOptions)).violations).toEqual([]);
  });
});
