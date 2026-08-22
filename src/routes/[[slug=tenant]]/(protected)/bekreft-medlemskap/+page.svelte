<script lang="ts">
  import { MembershipConfirmationScreen } from "$lib/features/policy";
  import { getSessionDataContext } from "$lib/features/session";
  import { buildTenantPath, getTenantContext } from "$lib/platform/tenant";

  const session = getSessionDataContext();
  const tenant = getTenantContext();
  const termsHref = buildTenantPath(tenant, "vilkaar");

  function refreshPolicyState() {
    return session.invalidateBruker();
  }
</script>

<svelte:head><title>Bekreft medlemskap | Banebooking</title></svelte:head>

{#if session.klubb && session.bruker}
  <MembershipConfirmationScreen
    klubb={session.klubb}
    bruker={session.bruker}
    onConfirmed={refreshPolicyState}
    {termsHref}
  />
{/if}
