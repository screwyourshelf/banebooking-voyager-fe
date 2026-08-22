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
  data-ui="collection-state"
  data-tone={tone}
  {role}
  aria-live={tone === "danger" ? "assertive" : "polite"}
  aria-atomic="true"
>
  <span data-part="indicator" aria-hidden="true">
    {#if icon}{@render icon()}{:else}<span data-part="mark"></span>{/if}
  </span>
  <strong data-part="title">{title}</strong>
  {#if description}<p data-part="description">{description}</p>{/if}
  {#if action}<div data-part="action">{@render action()}</div>{/if}
</div>
