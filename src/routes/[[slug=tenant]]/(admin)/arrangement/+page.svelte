<script lang="ts">
  import { ArrangementAdminScreen } from "$lib/features/arrangement-admin";
  import { getSessionDataContext } from "$lib/features/session";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Administrer arrangementer | Banebooking</title></svelte:head>

<ArrangementAdminScreen capabilities={session.bruker?.kapabiliteter ?? []} />
