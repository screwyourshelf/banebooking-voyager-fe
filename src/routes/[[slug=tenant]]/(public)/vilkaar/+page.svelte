<script lang="ts">
  import { TermsScreen } from "#lib/features/policy/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Vilkår for bruk | Banebooking</title></svelte:head>

{#if session.klubb}
  <TermsScreen klubb={session.klubb} />
{/if}
