<script lang="ts">
  import { resolve } from "$app/paths";
  const base = resolve("").replace(/\/$/, "");
  import { CourtAndActivityAdminScreen } from "#lib/features/court-and-activity-admin/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";
  import { buildTenantPath, getTenantContext } from "#lib/platform/tenant/index.ts";

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
