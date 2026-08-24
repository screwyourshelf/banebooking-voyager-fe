<script lang="ts" module>
  export type PageStatusTone = "danger" | "warning";
</script>

<script lang="ts">
  let { label, tone }: { label: string; tone: PageStatusTone } = $props();
</script>

<span
  class={[
    "inline-flex w-fit max-w-full flex-none items-center rounded-control px-status-inline py-page-status-block text-label font-page-status leading-page-status whitespace-nowrap",
    tone === "warning"
      ? "bg-status-warning-bg text-status-warning-text"
      : "bg-status-danger-bg text-status-danger-text",
  ]}
  data-ui="page-status"
  data-tone={tone}>{label}</span
>
