<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div data-route-access="protected">
  {@render children()}
</div>
