<script lang="ts">
  import type { Snippet } from "svelte";

  import "../index.css";

  let { children }: { children: Snippet } = $props();
</script>

{@render children()}
