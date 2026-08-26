// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import TermsScreen from "./TermsScreen.svelte";

const klubb = {
  feedSynligAntallDager: 30,
  kontaktEpost: "booking@fjordvik.no",
  navn: "Fjordvik Tennisklubb",
  slug: "fjordvik",
};

describe("terms screen", () => {
  it("tilpasser den offentlige vilkårsteksten til klubbdata og aktiv versjon", () => {
    render(TermsScreen, { klubb });

    expect(screen.getByRole("heading", { level: 1, name: "Vilkår for bruk" })).toBeInTheDocument();
    expect(screen.getByText("Oppdatert 22. august 2026")).toBeInTheDocument();
    expect(screen.getAllByText("Fjordvik Tennisklubb", { exact: false }).length).toBeGreaterThan(1);
    expect(screen.getByRole("link", { name: "booking@fjordvik.no" })).toHaveAttribute(
      "href",
      "mailto:booking@fjordvik.no"
    );
    expect(screen.getByRole("region", { name: "6. Kontakt" })).toHaveTextContent(
      "kontaktperson eller via e-post"
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
  });

  it("har ingen oppdagede tilgjengelighetsbrudd", async () => {
    const view = render(TermsScreen, { klubb });
    expect(
      (
        await axe.run(view.container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations
    ).toEqual([]);
  });
});
