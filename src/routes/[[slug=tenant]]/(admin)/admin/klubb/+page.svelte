<script lang="ts">
  import { ClubAndMembershipAdminScreen } from "$lib/features/club-and-membership-admin";
  import { getSessionDataContext } from "$lib/features/session";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Klubbinnstillinger | Banebooking</title></svelte:head>

{#if session.klubb}
  <ClubAndMembershipAdminScreen
    club={session.klubb}
    capabilities={session.bruker?.kapabiliteter ?? []}
  />
{/if}
