import type { QueryClient } from "@tanstack/svelte-query";
import type { OppdaterBrukerForespørsel, SperrBrukerForespørsel } from "$lib/contracts";
import type { ApiClient } from "$lib/platform/api";
import { tenantQueryMeta } from "$lib/platform/query";
import {
  blockUser,
  deleteAdminUser,
  getAdminUsers,
  getUserBlocks,
  revokeUserBlock,
  updateAdminUser,
} from "./api";
import { userAdminQueryKeys } from "./query-keys";

export function adminUsersQueryOptions(api: ApiClient, slug: string) {
  return {
    meta: tenantQueryMeta(slug, "users"),
    queryKey: userAdminQueryKeys.users(slug),
    queryFn: ({ signal }: { signal: AbortSignal }) => getAdminUsers(api, slug, signal),
    staleTime: 30_000,
  };
}

export function userBlocksQueryOptions(
  api: ApiClient,
  slug: string,
  userId: string,
  enabled: boolean
) {
  return {
    meta: tenantQueryMeta(slug, "user-blocks"),
    queryKey: userAdminQueryKeys.blocks(slug, userId),
    queryFn: ({ signal }: { signal: AbortSignal }) => getUserBlocks(api, slug, userId, signal),
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  };
}

async function invalidateUserAdmin(queryClient: QueryClient, slug: string, userId?: string) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: userAdminQueryKeys.users(slug) }),
  ];
  if (userId) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: userAdminQueryKeys.blocks(slug, userId) })
    );
  }
  await Promise.all(invalidations);
}

export function updateUserMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (input: { userId: string; request: OppdaterBrukerForespørsel }) =>
      updateAdminUser(api, slug, input.userId, input.request),
    onSuccess: () => invalidateUserAdmin(queryClient, slug),
    retry: false,
  };
}

export function deleteUserMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (userId: string) => deleteAdminUser(api, slug, userId),
    onSuccess: () => invalidateUserAdmin(queryClient, slug),
    retry: false,
  };
}

export function blockUserMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (input: { userId: string; request: SperrBrukerForespørsel }) =>
      blockUser(api, slug, input.userId, input.request),
    onSuccess: (_response: unknown, input: { userId: string }) =>
      invalidateUserAdmin(queryClient, slug, input.userId),
    retry: false,
  };
}

export function revokeBlockMutationOptions(api: ApiClient, queryClient: QueryClient, slug: string) {
  return {
    mutationFn: (input: { userId: string; blockId: string }) =>
      revokeUserBlock(api, slug, input.userId, input.blockId),
    onSuccess: (_response: unknown, input: { userId: string }) =>
      invalidateUserAdmin(queryClient, slug, input.userId),
    retry: false,
  };
}
