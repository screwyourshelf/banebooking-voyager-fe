import { describe, expect, it } from "vitest";
import { announcementAdminQueryKeys } from "./query-keys";

describe("announcement admin query keys", () => {
  it("isolerer den aktive kunngjøringen under featureens tenantgrense", () => {
    expect(announcementAdminQueryKeys.active("fjordvik")).toEqual([
      "announcement-admin",
      { slug: "fjordvik" },
      "active",
    ]);
  });
});
