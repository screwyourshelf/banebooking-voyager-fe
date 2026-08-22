<script lang="ts">
  import { BlockedAccountScreen } from "$lib/features/policy";
  import { getSessionDataContext } from "$lib/features/session";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Kontoen er sperret | Banebooking</title></svelte:head>

{#if session.klubb}
  <BlockedAccountScreen klubb={session.klubb} />
{/if}
