<script lang="ts">
  import { page } from "$app/state";
  import { ArrangementsScreen } from "$lib/features/arrangements";

  const initialArrangementId = $derived(page.url.searchParams.get("arrangement") ?? undefined);
</script>

<ArrangementsScreen {initialArrangementId} />
