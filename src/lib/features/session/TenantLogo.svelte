<script lang="ts">
  let {
    sources,
  }: {
    sources: readonly [tenantSvg: string, tenantWebp: string, defaultSvg: string];
  } = $props();

  let failedSources = $state<string[]>([]);
  const source = $derived(
    sources.find((candidate) => !failedSources.includes(candidate)) ?? sources.at(-1)!
  );

  function useFallback() {
    if (source !== sources.at(-1) && !failedSources.includes(source)) {
      failedSources = [...failedSources, source];
    }
  }
</script>

<img src={source} alt="" width="48" height="48" onerror={useFallback} />
