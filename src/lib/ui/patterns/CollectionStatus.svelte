<script lang="ts" module>
  export type CollectionStatusTone =
    | "available"
    | "own"
    | "event"
    | "busy"
    | "past"
    | "warning"
    | "danger";

  export type CollectionRowStatus = {
    appearance?: "badge" | "plain";
    label: string;
    tone: CollectionStatusTone;
  };
</script>

<script lang="ts">
  let { appearance = "badge", label, tone }: CollectionRowStatus = $props();
</script>

<span
  class={[
    "inline-flex w-fit max-w-full flex-none items-center rounded-control py-collection-status-block text-label font-collection-status leading-collection-status whitespace-nowrap",
    appearance === "plain" ? "px-0" : "px-status-inline",
    tone === "available"
      ? "bg-status-available-bg text-status-available-text"
      : tone === "own"
        ? "bg-status-own-bg text-status-own-text"
        : tone === "event"
          ? "bg-status-event-bg text-status-event-text"
          : tone === "busy"
            ? "bg-status-busy-bg text-status-busy-text"
            : tone === "past"
              ? "bg-status-past-bg text-status-past-text"
              : tone === "warning"
                ? "bg-status-warning-bg text-status-warning-text"
                : "bg-status-danger-bg text-status-danger-text",
  ]}
  data-ui="collection-status"
  data-tone={tone}
  data-appearance={appearance}>{label}</span
>
