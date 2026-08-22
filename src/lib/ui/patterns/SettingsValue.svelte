<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<strong data-ui="settings-value">{@render children()}</strong>
