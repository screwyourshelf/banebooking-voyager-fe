<script lang="ts">
  import { SessionGate } from "$lib/features/session";
  import { AppProviders } from "$lib/platform/app";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<AppProviders tenant={data.tenant}>
  <SessionGate>
    <div data-tenant={data.tenant.slug}>
      {@render children()}
    </div>
  </SessionGate>
</AppProviders>
