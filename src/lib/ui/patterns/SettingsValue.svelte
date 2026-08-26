<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<strong class="text-ink text-body-sm tabular-nums" data-ui="settings-value"
  >{@render children()}</strong
>
