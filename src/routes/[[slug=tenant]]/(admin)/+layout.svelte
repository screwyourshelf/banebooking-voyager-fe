<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div data-route-access="admin">
  {@render children()}
</div>
