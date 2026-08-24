<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    action?: Snippet;
    description?: string;
    icon?: Snippet;
    title: string;
    tone?: "empty" | "danger";
  };

  let { action, description, icon, title, tone = "empty" }: Props = $props();
  const role = $derived(tone === "danger" ? "alert" : "status");
</script>

<div
  class="flex min-h-collection-state items-center justify-center flex-col px-lg py-collection-state text-ink-soft text-center"
  data-ui="collection-state"
  data-tone={tone}
  {role}
  aria-live={tone === "danger" ? "assertive" : "polite"}
  aria-atomic="true"
>
  <span
    class={[
      "grid size-collection-state-indicator mb-collection-state-indicator-margin place-items-center rounded-collection-state-indicator collection-state-icon:size-collection-state-icon",
      tone === "danger"
        ? "bg-status-danger-bg collection-state-icon:text-status-danger-text"
        : "bg-brand-soft collection-state-icon:text-brand-strong",
    ]}
    data-part="indicator"
    aria-hidden="true"
  >
    {#if icon}
      {@render icon()}
    {:else}
      <span
        class={[
          "size-collection-state-mark rounded-control",
          tone === "danger" ? "bg-status-danger-text" : "bg-brand-strong",
        ]}
        data-part="mark"
      ></span>
    {/if}
  </span>
  <strong class="text-ink text-body-lg font-collection-state-title" data-part="title"
    >{title}</strong
  >
  {#if description}
    <p
      class="max-w-collection-state-description mt-collection-state-description mb-0 text-body-sm leading-collection-state-description"
      data-part="description"
    >
      {description}
    </p>
  {/if}
  {#if action}
    <div class="mt-collection-state-action" data-part="action">{@render action()}</div>
  {/if}
</div>
