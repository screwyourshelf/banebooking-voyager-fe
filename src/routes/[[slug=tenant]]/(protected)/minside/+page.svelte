<script lang="ts">
  import { page } from "$app/state";
  import { base } from "$app/paths";
  import { AccountScreen, resolveAccountTab } from "$lib/features/account";
  import { getSessionDataContext } from "$lib/features/session";
  import { buildTenantPath, getTenantContext } from "$lib/platform/tenant";

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
