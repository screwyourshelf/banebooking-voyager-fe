<script lang="ts">
  import { AppShell } from "../index";

  let { background = "court" }: { background?: "canvas" | "court" } = $props();
</script>

<AppShell {background} navigationLoadingLabel="Laster navigasjon …"></AppShell>
