<script lang="ts">
  import type { Snippet } from "svelte";

  export type FeedbackTone = "success" | "info" | "warning" | "danger";

  type Props = {
    action?: Snippet;
    description?: string;
    title: string;
    tone?: FeedbackTone;
  };

  let { action, description, title, tone = "info" }: Props = $props();
  const liveRole = $derived(tone === "danger" ? "alert" : "status");
</script>

<div
  data-ui="action-feedback"
  data-tone={tone}
  role={liveRole}
  aria-live={tone === "danger" ? "assertive" : "polite"}
  aria-atomic="true"
>
  <div data-part="content">
    <strong data-part="title">{title}</strong>
    {#if description}<p data-part="description">{description}</p>{/if}
  </div>
  {#if action}<div data-part="action">{@render action()}</div>{/if}
</div>
