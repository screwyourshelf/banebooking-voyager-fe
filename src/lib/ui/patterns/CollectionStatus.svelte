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

<span data-ui="collection-status" data-tone={tone} data-appearance={appearance}>{label}</span>
