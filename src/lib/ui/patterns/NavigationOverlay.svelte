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

<DialogPrimitive bind:open {onClose} {pending} size="standard">
  {#snippet children({ close })}
    <div
      data-ui="navigation-overlay"
      data-presentation={presentation}
      data-state={pending ? "pending" : "ready"}
    >
      <div data-part="header">
        <div data-part="intro">
          <DialogTitle data-part="title">{title}</DialogTitle>
          {#if description}
            <DialogDescription data-part="description">{description}</DialogDescription>
          {/if}
        </div>
        <Button
          aria-label="Lukk meny"
          data-part="close"
          disabled={pending}
          onclick={close}
          size="icon"
          variant="ghost"
        >
          <span aria-hidden="true">×</span>
        </Button>
      </div>
      <div data-part="content">{@render children({ close })}</div>
    </div>
  {/snippet}
</DialogPrimitive>
