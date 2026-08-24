<script lang="ts" module>
  export type DialogActionContext = {
    close: () => void;
    pending: boolean;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Button from "../primitives/Button.svelte";
  import DialogDescription from "../primitives/DialogDescription.svelte";
  import DialogPrimitive from "../primitives/DialogPrimitive.svelte";
  import DialogTitle from "../primitives/DialogTitle.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
    actions?: Snippet<[DialogActionContext]>;
    children: Snippet;
    description?: string;
    onClose?: () => void;
    open?: boolean;
    pending?: boolean;
    title: string;
  };

  let {
    actions,
    children: content,
    description,
    onClose,
    open = $bindable(false),
    pending = false,
    title,
    ...attributes
  }: Props = $props();
</script>

<DialogPrimitive bind:open {onClose} {pending} size="standard">
  {#snippet children({ close })}
    <div {...attributes} data-ui="dialog" data-state={pending ? "pending" : "ready"}>
      <div data-part="header">
        <div data-part="intro">
          <DialogTitle data-part="title">{title}</DialogTitle>
          {#if description}
            <DialogDescription data-part="description">{description}</DialogDescription>
          {/if}
        </div>
        <Button
          aria-label="Lukk dialog"
          data-part="close"
          disabled={pending}
          onclick={close}
          size="compact-icon"
          variant="ghost"
        >
          <span aria-hidden="true">×</span>
        </Button>
      </div>

      <div data-part="content">{@render content()}</div>

      {#if actions}
        <div data-part="actions">{@render actions({ close, pending })}</div>
      {/if}
    </div>
  {/snippet}
</DialogPrimitive>
