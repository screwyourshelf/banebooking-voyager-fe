<script lang="ts">
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  const base = resolve("").replace(/\/$/, "");
  import { AccountScreen, resolveAccountTab } from "#lib/features/account/index.ts";
  import { getSessionDataContext } from "#lib/features/session/index.ts";
  import { buildTenantPath, getTenantContext } from "#lib/platform/tenant/index.ts";

  const tenant = getTenantContext();
  const session = getSessionDataContext();
  const accountPath = buildTenantPath(tenant, "minside", base);
  const profileHref = `${accountPath}?tab=profil`;
  const dataHref = `${accountPath}?tab=persondata`;
  const termsHref = buildTenantPath(tenant, "vilkaar", base);
  const activeTab = $derived(resolveAccountTab(page.url.searchParams.get("tab")));
</script>

<AccountScreen
  {activeTab}
  {profileHref}
  {dataHref}
  {termsHref}
  user={session.bruker}
  status={session.brukerStatus}
  isFetching={session.brukerFetching}
  onRetry={session.refetchBruker}
  onUserUpdated={session.invalidateBruker}
/>
