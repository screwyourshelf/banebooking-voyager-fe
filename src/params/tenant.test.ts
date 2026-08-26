import { describe, expect, it } from "vitest";

import { match } from "./tenant";

describe("tenant matcher", () => {
  it.each(["aas-tennisklubb", "klubb2", "tennis-2026"])("godtar %s", (slug) => {
    expect(match(slug)).toBe(true);
  });

  it.each(["auth", "admin", "api", "_app", "Stor-Klubb", "ikke_en_slug"])("avviser %s", (slug) => {
    expect(match(slug)).toBe(false);
  });
});
