import { describe, expect, it } from "vitest";
import { formatNewsDate, safeExternalNewsUrl, textFromNewsContent } from "./model";

describe("news presentation", () => {
  it("gjør HTML-innhold om til kompakt ren tekst og formaterer gyldig dato", () => {
    expect(textFromNewsContent("<p>Ny <strong>sesong</strong></p>\n<p>Velkommen!</p>")).toBe(
      "Ny sesong Velkommen!"
    );
    expect(formatNewsDate("2026-08-23T12:00:00Z")).toBe("23. august 2026");
    expect(formatNewsDate("ugyldig")).toBeNull();
  });

  it("tillater bare eksplisitte http- og https-lenker", () => {
    expect(safeExternalNewsUrl("https://example.no/sak")).toBe("https://example.no/sak");
    expect(safeExternalNewsUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalNewsUrl("/lokal")).toBeNull();
  });
});
