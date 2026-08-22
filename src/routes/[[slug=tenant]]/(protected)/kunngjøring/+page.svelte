<script lang="ts">
  import { RequiredAnnouncementScreen } from "$lib/features/policy";
  import { getSessionDataContext } from "$lib/features/session";

  const session = getSessionDataContext();

  function refreshPolicyState() {
    return session.invalidateBruker();
  }
</script>

<svelte:head><title>Kunngjøring | Banebooking</title></svelte:head>

{#if session.bruker?.ulestKunngjøring}
  <RequiredAnnouncementScreen
    announcement={session.bruker.ulestKunngjøring}
    onConfirmed={refreshPolicyState}
  />
{/if}
