<script lang="ts">
  import {
    SessionDataProvider,
    SessionGate,
    SessionNavigationShell,
  } from "#lib/features/session/index.ts";
  import { AppProviders } from "#lib/platform/app/index.ts";
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
