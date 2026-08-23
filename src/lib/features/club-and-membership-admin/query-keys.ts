import { createTenantQueryKey } from "$lib/platform/query";

export const clubAndMembershipAdminQueryKeys = {
  all: (slug: string) => createTenantQueryKey("club-and-membership-admin", slug),
  membershipStatus: (slug: string) =>
    [...clubAndMembershipAdminQueryKeys.all(slug), "membership-status"] as const,
};
