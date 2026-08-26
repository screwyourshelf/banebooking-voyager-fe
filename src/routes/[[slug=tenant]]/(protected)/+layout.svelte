<script lang="ts">
  import { AccessGuard } from "$lib/features/session";
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<AccessGuard mode="protected">
  <div data-route-access="protected">
    {@render children()}
  </div>
</AccessGuard>
