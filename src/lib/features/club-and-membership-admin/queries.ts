import type { QueryClient } from "@tanstack/svelte-query";
import type {
  AktiverMedlemskapBekreftelseForespørsel,
  OppdaterKlubbForespørsel,
} from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { invalidateTenantResources, tenantQueryMeta } from "$lib/platform/query";
import {
  activateMembershipConfirmation,
  deactivateMembershipConfirmation,
  getMembershipStatus,
  updateClub,
} from "./api";
import { clubAndMembershipAdminQueryKeys } from "./query-keys";

export function membershipStatusQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "membership-policy"),
    queryKey: clubAndMembershipAdminQueryKeys.membershipStatus(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getMembershipStatus(api, slug, signal),
    staleTime: 30_000,
  };
}

export function updateClubMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (request: OppdaterKlubbForespørsel) => updateClub(api, slug, request),
    onSuccess: () => invalidateTenantResources(queryClient, slug, ["club"]),
    retry: false,
  };
}

export function activateMembershipMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: (request: AktiverMedlemskapBekreftelseForespørsel) =>
      activateMembershipConfirmation(api, slug, request),
    onSuccess: () => invalidateTenantResources(queryClient, slug, ["membership-policy", "user"]),
    retry: false,
  };
}

export function deactivateMembershipMutationOptions(
  api: ApiClient,
  queryClient: QueryClient,
  slug: string
) {
  return {
    mutationFn: () => deactivateMembershipConfirmation(api, slug),
    onSuccess: () => invalidateTenantResources(queryClient, slug, ["membership-policy", "user"]),
    retry: false,
  };
}
