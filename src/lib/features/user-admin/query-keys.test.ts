import { describe, expect, it } from "vitest";
import { userAdminQueryKeys } from "./query-keys";

describe("user admin query keys", () => {
  it("isolerer listen og hver sperrehistorikk under samme tenantgrense", () => {
    expect(userAdminQueryKeys.users("fjordvik")).toEqual([
      "user-admin",
      { slug: "fjordvik" },
      "users",
    ]);
    expect(userAdminQueryKeys.blocks("fjordvik", "user-1")).toEqual([
      "user-admin",
      { slug: "fjordvik" },
      "blocks",
      "user-1",
    ]);
  });
});
