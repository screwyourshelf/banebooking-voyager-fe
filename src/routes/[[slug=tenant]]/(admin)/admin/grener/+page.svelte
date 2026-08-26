<script lang="ts">
  import { base } from "$app/paths";
  import { CourtAndActivityAdminScreen } from "$lib/features/court-and-activity-admin";
  import { getSessionDataContext } from "$lib/features/session";
  import { buildTenantPath, getTenantContext } from "$lib/platform/tenant";

  const session = getSessionDataContext();
  const tenant = getTenantContext();
  const courtsHref = buildTenantPath(tenant, "admin/baner", base);
  const activitiesHref = buildTenantPath(tenant, "admin/grener", base);
</script>

<svelte:head><title>Baner og grener | Banebooking</title></svelte:head>

<CourtAndActivityAdminScreen
  section="activities"
  capabilities={session.bruker?.kapabiliteter ?? []}
  {courtsHref}
  {activitiesHref}
/>
