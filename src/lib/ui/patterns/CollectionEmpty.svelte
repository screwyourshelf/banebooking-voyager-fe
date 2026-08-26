<script lang="ts">
  import type { Snippet } from "svelte";
  import CollectionState from "./CollectionState.svelte";

  let {
    action,
    description,
    icon,
    title,
  }: { action?: Snippet; description?: string; icon?: Snippet; title: string } = $props();
</script>

<CollectionState {action} {description} {icon} {title} />
