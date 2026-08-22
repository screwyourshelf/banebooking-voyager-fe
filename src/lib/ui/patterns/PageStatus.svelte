<script lang="ts" module>
  export type PageStatusTone = "danger" | "warning";
</script>

<script lang="ts">
  let { label, tone }: { label: string; tone: PageStatusTone } = $props();
</script>

<span data-ui="page-status" data-tone={tone}>{label}</span>
