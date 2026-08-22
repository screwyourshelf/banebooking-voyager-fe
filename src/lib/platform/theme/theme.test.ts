import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, isTheme, resolveTheme, toggleTheme } from "./theme";

describe("theme contract", () => {
  it("accepts only the two supported product themes", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("falls back deterministically for missing or stale stored values", () => {
    expect(resolveTheme(null)).toBe(DEFAULT_THEME);
    expect(resolveTheme("system")).toBe(DEFAULT_THEME);
    expect(resolveTheme(undefined, "dark")).toBe("dark");
  });

  it("toggles between light and dark without a third state", () => {
    expect(toggleTheme("light")).toBe("dark");
    expect(toggleTheme("dark")).toBe("light");
  });
});
