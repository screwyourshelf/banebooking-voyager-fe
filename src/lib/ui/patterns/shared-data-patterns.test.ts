// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/svelte";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import SharedDataPatternsFixture from "./SharedDataPatternsFixture.test.svelte";
import Weather from "./Weather.svelte";

const axeOptions: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false } },
};

describe("public shared data patterns", () => {
  it("eier tidsområde, værtilbehør og statiske semantiske utilities", () => {
    const { container } = render(SharedDataPatternsFixture);
    const schedule = container.querySelector('[data-ui="schedule-time"]');
    const range = schedule?.querySelector('[data-part="range"]');
    const start = schedule?.querySelector('[data-part="start"]');
    const end = schedule?.querySelector('[data-part="end"]');
    const accessory = schedule?.querySelector('[data-part="accessory"]');

    expect(schedule).toHaveClass(
      "flex",
      "gap-schedule-time",
      "text-ink-faint",
      "font-schedule-time",
      "tabular-nums"
    );
    expect(range).toHaveClass("grid", "gap-schedule-time-range", "whitespace-nowrap");
    expect(start).toHaveTextContent("10:00");
    expect(start).toHaveClass(
      "text-choice-indicator",
      "text-body-lg",
      "font-schedule-time-start",
      "leading-schedule-time",
      "tracking-schedule-time-start"
    );
    expect(end).toHaveTextContent("11:00");
    expect(end).toHaveClass("text-caption", "leading-schedule-time");
    expect(accessory).toHaveClass("inline-flex");

    const compactWeather = accessory?.querySelector('[data-ui="weather"]');
    expect(compactWeather).toHaveAttribute("data-variant", "compact");
    expect(compactWeather).toHaveClass("inline-flex", "gap-xs", "text-ink-soft", "text-caption");
    expect(compactWeather).toHaveTextContent("18°");
    expect(compactWeather).not.toHaveTextContent("m/s");
  });

  it("bevarer symbol, enheter og full værpresentasjon", () => {
    const { container } = render(SharedDataPatternsFixture);
    const weather = container.querySelector('[data-ui="weather"][data-variant="default"]');
    const icon = weather?.querySelector('[data-part="icon"]');

    expect(weather).toHaveClass("inline-flex", "gap-xs", "text-ink-soft", "text-body-sm");
    expect(weather).toHaveTextContent("19°");
    expect(weather).toHaveTextContent("4 m/s");
    expect(icon).toHaveAttribute("alt", "");
    expect(icon).toHaveAttribute("draggable", "false");
    expect(icon).toHaveAttribute("src", "/weather-symbols/svg/cloudy.svg");
    expect(icon).toHaveClass("size-weather-icon", "select-none");
  });

  it("rendrer ingen værflate uten presentasjonsdata", () => {
    const { container } = render(Weather);
    expect(container.querySelector('[data-ui="weather"]')).not.toBeInTheDocument();
  });

  it("eier responsive MetricGrid-skift uten å overta statistikkens Metric-styling", () => {
    const { container } = render(SharedDataPatternsFixture);
    const defaultGrid = screen.getByRole("region", { name: "Nøkkeltall" });
    const membersGrid = screen.getByRole("region", { name: "Medlemsnøkkeltall" });

    expect(defaultGrid).toHaveClass("md:grid-cols-4", "md:gap-metric-grid-wide");
    expect(membersGrid).toHaveClass("md:grid-cols-3", "md:gap-metric-grid-wide");
    expect(defaultGrid).toHaveAttribute("data-variant", "default");
    expect(membersGrid).toHaveAttribute("data-variant", "members");

    const metric = within(defaultGrid).getByRole("article");
    expect(metric).toHaveAttribute("data-ui", "metric");
    expect(metric.querySelector('[data-stat-role="key-value"]')).toHaveTextContent(/44,5\s*t/);
    expect(metric.querySelector('[data-part="change"]')).toHaveAttribute("data-direction", "down");
    expect(container.querySelectorAll('[data-testid="metric-icon"]')).toHaveLength(2);
  });

  it("har ingen registrerbare tilgjengelighetsbrudd", async () => {
    const result = render(SharedDataPatternsFixture);
    expect((await axe.run(result.container, axeOptions)).violations).toEqual([]);
  });
});
