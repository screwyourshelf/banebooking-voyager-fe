<script lang="ts">
  import { ArrangementAdminScreen } from "#lib/features/arrangement-admin/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Administrer arrangementer | Banebooking</title></svelte:head>

<ArrangementAdminScreen capabilities={session.bruker?.kapabiliteter ?? []} />
