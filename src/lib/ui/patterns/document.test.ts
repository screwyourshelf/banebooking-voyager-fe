// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import DocumentFixture from "./DocumentFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  // jsdom has no canvas implementation; color contrast is verified in browser rendering below.
  rules: { "color-contrast": { enabled: false } },
};

describe("public Document patterns", () => {
  it("composes one reading landmark under the page heading", () => {
    render(DocumentFixture);

    expect(screen.getByRole("main")).toHaveAttribute("data-ui", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Vilkår for bruk" })).toBeInTheDocument();
    expect(screen.getByText("Oppdatert 22. august 2026")).toBeInTheDocument();

    const document = screen.getByRole("article", { name: "Vilkårsdokument" });
    expect(document).toHaveAttribute("data-ui", "document");
    expect(within(document).getByText(/Disse vilkårene gjelder/)).toBeInTheDocument();
  });

  it("owns named sections and a stable h2 hierarchy", () => {
    render(DocumentFixture);

    const firstSection = screen.getByRole("region", { name: "1. Bruk av tjenesten" });
    expect(firstSection).toHaveAttribute("data-ui", "document-section");
    expect(within(firstSection).getByRole("heading", { level: 2 })).toHaveTextContent(
      "1. Bruk av tjenesten"
    );
    expect(within(firstSection).getByText("Dette gjelder alle som booker.")).toHaveAttribute(
      "data-part",
      "description"
    );

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });

  it("renders document facts as ordered terms and definitions", () => {
    render(DocumentFixture);

    const facts = screen.getByLabelText("Gjeldende bookingregler");
    expect(
      within(facts)
        .getAllByRole("term")
        .map((term) => term.textContent)
    ).toEqual(["Åpningstid", "Varighet"]);
    expect(
      within(facts)
        .getAllByRole("definition")
        .map((definition) => definition.textContent)
    ).toEqual(["07:00–23:00", "60 minutter"]);
  });

  it("preserves internal and contact link semantics", () => {
    render(DocumentFixture);

    expect(screen.getByRole("link", { name: "booking@fjordvik.no" })).toHaveAttribute(
      "href",
      "mailto:booking@fjordvik.no"
    );
    expect(screen.getByRole("link", { name: "Les om medlemskap" })).toHaveAttribute(
      "href",
      "#medlemskap"
    );
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(DocumentFixture);
    expect((await axe.run(container, axeOptions)).violations).toEqual([]);
  });
});
