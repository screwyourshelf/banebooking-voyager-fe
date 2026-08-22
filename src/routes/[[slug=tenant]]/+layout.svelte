<script lang="ts">
  import { SessionGate } from "$lib/features/session";
  import { AppProviders } from "$lib/platform/app";
  import { AppShell } from "$lib/ui";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<AppProviders tenant={data.tenant}>
  <AppShell navigationLoadingLabel="Laster navigasjon …">
    <SessionGate>
      {@render children()}
    </SessionGate>
  </AppShell>
</AppProviders>
