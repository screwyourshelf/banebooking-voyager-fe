<script lang="ts">
  import type { Snippet } from "svelte";
  import { ThemeProvider } from "$lib/platform/theme";

  import "../index.css";

  let { children }: { children: Snippet } = $props();
</script>

<ThemeProvider>
  {@render children()}
</ThemeProvider>
