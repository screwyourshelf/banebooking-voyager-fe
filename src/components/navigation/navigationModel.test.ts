import { describe, expect, it } from "vitest";

import { buildMobilePrimaryNavigation, buildMobileSecondaryNavigation } from "./navigationModel";

describe("mobilnavigasjon", () => {
  it("dupliserer ikke primærnavigasjonen i Mer-menyen", () => {
    const primaryIds = new Set(buildMobilePrimaryNavigation(true, []).map((item) => item.id));
    const secondaryIds = buildMobileSecondaryNavigation(true, []).flatMap((section) =>
      section.items.map((item) => item.id)
    );

    expect(secondaryIds.every((id) => !primaryIds.has(id))).toBe(true);
    expect(secondaryIds).toContain("profile");
    expect(secondaryIds).not.toContain("my-bookings");
  });
});
