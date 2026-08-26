// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import TabsFixture from "./TabsFixture.test.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

describe("public Tabs pattern", () => {
  it("eier lokal visningsstate og automatisk piltastnavigasjon", async () => {
    const result = render(TabsFixture);
    expect(result.container.querySelector('[data-ui-primitive="tabs"]')).toHaveClass(
      "min-w-0",
      "grid",
      "gap-lg",
      "md:gap-xl",
      "lg:gap-md"
    );
    expect(screen.getByRole("tablist")).toHaveClass(
      "grid-cols-2",
      "border-tabs-list-border",
      "bg-tabs-list",
      "md:min-w-tabs-list"
    );
    const profile = screen.getByRole("tab", { name: "Klubbprofil" });
    const membership = screen.getByRole("tab", { name: "Medlemskap" });

    expect(profile).toHaveClass(
      "min-h-tabs-trigger",
      "font-tabs-trigger",
      "after:h-tabs-indicator",
      "data-[state=active]:bg-tabs-active-surface"
    );
    expect(screen.getByText("Klubbprofilinnhold").parentElement).toHaveClass(
      "min-w-0",
      "lg:relative",
      "lg:z-1"
    );
    expect(profile).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Klubbprofilinnhold")).toBeVisible();

    profile.focus();
    await fireEvent.keyDown(profile, { key: "ArrowRight" });
    expect(membership).toHaveFocus();
    expect(membership).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Medlemskapsinnhold")).toBeVisible();
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });
});
