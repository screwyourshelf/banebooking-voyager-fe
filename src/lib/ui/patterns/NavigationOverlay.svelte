<script lang="ts" module>
  export type NavigationOverlayContext = {
    close: () => void;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "../primitives/Button.svelte";
  import DialogDescription from "../primitives/DialogDescription.svelte";
  import DialogPrimitive from "../primitives/DialogPrimitive.svelte";
  import DialogTitle from "../primitives/DialogTitle.svelte";

  type Props = {
    children: Snippet<[NavigationOverlayContext]>;
    description?: string;
    onClose?: () => void;
    open?: boolean;
    pending?: boolean;
    presentation: "account" | "more";
    title: string;
  };

  let {
    children,
    description,
    onClose,
    open = $bindable(false),
    pending = false,
    presentation,
    title,
  }: Props = $props();
</script>

<DialogPrimitive
  bind:open
  {onClose}
  {pending}
  placement={presentation === "more" ? "bottom" : "center"}
  size="standard"
>
  {#snippet children({ close })}
    <div
      class="flex min-w-0 max-h-navigation-overlay flex-1 flex-col"
      data-ui="navigation-overlay"
      data-presentation={presentation}
      data-state={pending ? "pending" : "ready"}
    >
      <div
        class="flex items-start justify-between gap-md border-b border-line px-lg pt-lg pb-navigation-overlay-header"
        data-part="header"
      >
        <div class="grid min-w-0 gap-2xs" data-part="intro">
          <DialogTitle
            class="overflow-hidden text-ink text-body-lg font-navigation-overlay-title text-ellipsis whitespace-nowrap"
            data-part="title">{title}</DialogTitle
          >
          {#if description}
            <DialogDescription
              class="overflow-hidden text-ink-soft text-body-sm text-ellipsis whitespace-nowrap"
              data-part="description">{description}</DialogDescription
            >
          {/if}
        </div>
        <Button
          aria-label="Lukk meny"
          class="flex-none"
          data-part="close"
          disabled={pending}
          onclick={close}
          size="icon"
          variant="ghost"
        >
          <span aria-hidden="true">×</span>
        </Button>
      </div>
      <div class="min-w-0 overflow-y-auto p-lg" data-part="content">
        {@render children({ close })}
      </div>
    </div>
  {/snippet}
</DialogPrimitive>
