<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div
  class="text-ink-soft text-body-sm leading-settings-text whitespace-pre-wrap"
  data-ui="settings-text"
>
  {@render children()}
</div>
