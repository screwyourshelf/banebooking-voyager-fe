<script lang="ts">
  import { BlockedAccountScreen } from "#lib/features/policy/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Kontoen er sperret | Banebooking</title></svelte:head>

{#if session.klubb}
  <BlockedAccountScreen klubb={session.klubb} />
{/if}
