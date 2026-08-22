<script lang="ts">
  import { SessionDataProvider, SessionGate, SessionNavigationShell } from "$lib/features/session";
  import { AppProviders } from "$lib/platform/app";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<AppProviders tenant={data.tenant}>
  <SessionDataProvider>
    <SessionNavigationShell>
      <SessionGate>
        {@render children()}
      </SessionGate>
    </SessionNavigationShell>
  </SessionDataProvider>
</AppProviders>
