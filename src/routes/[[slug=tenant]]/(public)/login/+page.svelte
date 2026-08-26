<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import { base, resolve } from "$app/paths";
  import { page } from "$app/state";
  import { LoginScreen } from "$lib/features/auth";
  import { publicConfig } from "$lib/platform/config";
  import {
    buildTenantPath,
    getTenantContext,
    readSafeReturnPath,
    stripBasePath,
  } from "$lib/platform/tenant";

  const tenant = getTenantContext();
  const returnPath = $derived(
    readSafeReturnPath(page.url.searchParams.get("returnTo"), tenant, base) ??
      buildTenantPath(tenant, "", base)
  );
  const termsHref = $derived(buildTenantPath(tenant, "vilkaar"));
  const callbackUrl = $derived.by(() => {
    const url = new URL(resolve("/auth/callback"), page.url.origin);
    url.searchParams.set("returnTo", returnPath);
    return url.toString();
  });

  function returnAfterLogin() {
    return goto(resolve(stripBasePath(returnPath, base)), { replaceState: true });
  }
</script>

<svelte:head><title>Logg inn | Banebooking</title></svelte:head>

<LoginScreen
  {callbackUrl}
  developmentLoginEnabled={dev}
  idrettensIdEnabled={publicConfig.enableIdrettensId}
  onLoginSuccess={returnAfterLogin}
  {termsHref}
/>
