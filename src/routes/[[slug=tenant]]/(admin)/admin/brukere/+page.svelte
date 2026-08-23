<script lang="ts">
  import { UserAdminScreen } from "$lib/features/user-admin";
  import { getSessionDataContext } from "$lib/features/session";

  const session = getSessionDataContext();
</script>

<svelte:head><title>Brukere | Banebooking</title></svelte:head>

<UserAdminScreen
  currentUserId={session.bruker?.id ?? ""}
  capabilities={session.bruker?.kapabiliteter ?? []}
/>
