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
    expect(result.container.querySelector('[data-ui-primitive="tabs"]')).toHaveClass("min-w-0");
    const profile = screen.getByRole("tab", { name: "Klubbprofil" });
    const membership = screen.getByRole("tab", { name: "Medlemskap" });

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
