<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { ThemeProvider } from "#lib/platform/theme/index.ts";

  import "../index.css";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    void import("#lib/platform/app/browser-startup.client.ts").then(
      ({ completeBrowserAppStartup }) => completeBrowserAppStartup()
    );
  });
</script>

<ThemeProvider>
  {@render children()}
</ThemeProvider>
