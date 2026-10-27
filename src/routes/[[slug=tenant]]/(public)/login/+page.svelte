<script lang="ts">
  import { dev } from "$app/env";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  const base = resolve("").replace(/\/$/, "");
  import { page } from "$app/state";
  import { LoginScreen } from "#lib/features/auth/index.ts";
  import { publicConfig } from "#lib/platform/config/index.ts";
  import {
    buildTenantPath,
    getTenantContext,
    readSafeReturnPath,
    stripBasePath,
  } from "#lib/platform/tenant/index.ts";

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
    return goto(resolve(stripBasePath(returnPath, base).slice(1)), { replace: true });
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
