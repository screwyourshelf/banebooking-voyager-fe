import { describe, expect, it } from "vitest";
import { lesSupabasePublishableKey } from "@/config";

describe("lesSupabasePublishableKey", () => {
  it("bruker en ny publishable key", () => {
    expect(lesSupabasePublishableKey(" sb_publishable_ny ")).toBe("sb_publishable_ny");
  });

  it("avviser legacy anon-nøkkel", () => {
    expect(() => lesSupabasePublishableKey("legacy-anon")).toThrow("sb_publishable_");
  });

  it("returnerer tom verdi når ingen nøkkel er konfigurert", () => {
    expect(lesSupabasePublishableKey()).toBe("");
  });
});
