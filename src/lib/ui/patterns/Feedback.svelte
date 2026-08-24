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
  class={[
    "grid w-full grid-cols-1 items-center gap-md border border-s-feedback-indicator rounded-record p-md md:grid-cols-feedback-wide",
    tone === "success"
      ? "border-feedback-success-border border-s-status-available-indicator bg-feedback-success-surface text-status-available-text"
      : tone === "info"
        ? "border-feedback-info-border border-s-status-own-text bg-feedback-info-surface text-status-own-text"
        : tone === "warning"
          ? "border-feedback-warning-border border-s-status-warning-indicator bg-feedback-warning-surface text-status-warning-text"
          : "border-feedback-danger-border border-s-status-danger-indicator bg-feedback-danger-surface text-status-danger-text",
  ]}
  data-ui="action-feedback"
  data-tone={tone}
  role={liveRole}
  aria-live={tone === "danger" ? "assertive" : "polite"}
  aria-atomic="true"
>
  <div class="grid min-w-0 gap-2xs" data-part="content">
    <strong class="font-feedback-title leading-feedback-title" data-part="title">{title}</strong>
    {#if description}
      <p
        class="m-0 text-feedback-description text-body-sm leading-feedback-description"
        data-part="description"
      >
        {description}
      </p>
    {/if}
  </div>
  {#if action}
    <div
      class="justify-self-stretch feedback-action-control:w-full md:justify-self-end md:feedback-action-control:w-auto"
      data-part="action"
    >
      {@render action()}
    </div>
  {/if}
</div>
