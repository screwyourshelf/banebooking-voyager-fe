import { describe, expect, it } from "vitest";
import { velgSupabaseKlientnøkkel } from "@/config";

describe("velgSupabaseKlientnøkkel", () => {
  it("foretrekker publishable key når begge er konfigurert", () => {
    expect(velgSupabaseKlientnøkkel("sb_publishable_ny", "legacy-anon")).toBe("sb_publishable_ny");
  });

  it("bruker legacy anon som fallback i overgangsperioden", () => {
    expect(velgSupabaseKlientnøkkel(undefined, "legacy-anon")).toBe("legacy-anon");
  });

  it("returnerer tom verdi når ingen nøkkel er konfigurert", () => {
    expect(velgSupabaseKlientnøkkel()).toBe("");
  });
});
