<script lang="ts">
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { Snippet } from "svelte";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext } from "$lib/platform/tenant";
  import { getBrukerWithCurrentTermsAcceptance, getKlubb } from "./api";
  import { setSessionDataContext, type SessionDataContext } from "./context";
  import { invalidateSessionBruker, sessionQueryKeys } from "./query-keys";

  let { children }: { children: Snippet } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();

  const klubbQuery = createQuery(() => ({
    queryKey: sessionQueryKeys.klubb(tenant.slug),
    queryFn: () => getKlubb(api, tenant.slug),
  }));

  const brukerQuery = createQuery(() => ({
    queryKey: sessionQueryKeys.bruker(tenant.slug),
    queryFn: () => getBrukerWithCurrentTermsAcceptance(api, tenant.slug),
    enabled: auth.state.status === "authenticated" && klubbQuery.isSuccess,
    staleTime: 60_000,
  }));

  const session: SessionDataContext = {
    get bruker() {
      return brukerQuery.data;
    },
    get brukerFetching() {
      return brukerQuery.isFetching;
    },
    get brukerStatus() {
      return brukerQuery.status;
    },
    get klubb() {
      return klubbQuery.data;
    },
    get klubbFetching() {
      return klubbQuery.isFetching;
    },
    get klubbStatus() {
      return klubbQuery.status;
    },
    invalidateBruker: () => invalidateSessionBruker(queryClient, tenant.slug),
    refetchBruker: () => brukerQuery.refetch(),
    refetchKlubb: () => klubbQuery.refetch(),
  };

  setSessionDataContext(session);
</script>

{@render children()}
