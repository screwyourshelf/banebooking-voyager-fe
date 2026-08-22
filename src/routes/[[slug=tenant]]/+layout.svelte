<script lang="ts">
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<div data-tenant={data.tenant.slug}>
  {@render children()}
</div>
