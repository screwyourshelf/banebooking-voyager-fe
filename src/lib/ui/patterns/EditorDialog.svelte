<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Button from "../primitives/Button.svelte";
  import DialogDescription from "../primitives/DialogDescription.svelte";
  import DialogPrimitive from "../primitives/DialogPrimitive.svelte";
  import DialogTitle from "../primitives/DialogTitle.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
    backLabel: string;
    children: Snippet;
    description: string;
    eyebrow: string;
    onClose?: () => void;
    open?: boolean;
    pending?: boolean;
    title: string;
  };

  let {
    backLabel,
    children: content,
    description,
    eyebrow,
    onClose,
    open = $bindable(false),
    pending = false,
    title,
    ...attributes
  }: Props = $props();
</script>

<DialogPrimitive bind:open {onClose} {pending} size="editor">
  {#snippet children({ close })}
    <div {...attributes} data-ui="editor-dialog" data-state={pending ? "pending" : "ready"}>
      <div data-part="header" data-surface="control">
        <Button data-part="back" disabled={pending} onclick={close} size="small" variant="ghost">
          <span data-part="back-icon" aria-hidden="true">←</span>
          {backLabel}
        </Button>

        <div data-part="intro">
          <span data-part="eyebrow">{eyebrow}</span>
          <DialogTitle data-part="title">{title}</DialogTitle>
          <DialogDescription data-part="description">{description}</DialogDescription>
        </div>
      </div>

      <div data-part="content">{@render content()}</div>
    </div>
  {/snippet}
</DialogPrimitive>
