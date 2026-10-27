<script lang="ts">
  import { UserAdminScreen } from "#lib/features/user-admin/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Brukere | Banebooking</title></svelte:head>

<UserAdminScreen
  currentUserId={session.bruker?.id ?? ""}
  capabilities={session.bruker?.kapabiliteter ?? []}
/>
