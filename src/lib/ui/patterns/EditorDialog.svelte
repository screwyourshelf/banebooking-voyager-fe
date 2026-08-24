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
    <div
      {...attributes}
      class="flex w-full h-full flex-col gap-0 overflow-hidden rounded-none bg-surface-subtle p-0 md:rounded-dialog"
      data-ui="editor-dialog"
      data-state={pending ? "pending" : "ready"}
    >
      <div
        class="flex-none border-b border-editor-dialog-divider bg-editor-dialog-header px-editor-dialog-padding pb-editor-dialog-padding pt-editor-dialog-safe text-control-text md:px-editor-dialog-wide-inline md:py-lg editor-dialog-back:w-fit editor-dialog-back:-ml-sm editor-dialog-back:text-control-muted editor-dialog-back-hover:bg-editor-dialog-back-hover editor-dialog-back-hover:text-control-text"
        data-part="header"
        data-surface="control"
      >
        <Button data-part="back" disabled={pending} onclick={close} size="small" variant="ghost">
          <span data-part="back-icon" aria-hidden="true">←</span>
          {backLabel}
        </Button>

        <div class="grid gap-editor-dialog-intro" data-part="intro">
          <span
            class="text-editor-dialog-eyebrow text-label font-editor-dialog-eyebrow tracking-editor-dialog-eyebrow uppercase"
            data-part="eyebrow">{eyebrow}</span
          >
          <DialogTitle
            class="text-control-text font-display text-editor-dialog-title font-editor-dialog-title tracking-editor-dialog-title leading-editor-dialog-title md:text-editor-dialog-title-wide"
            data-part="title">{title}</DialogTitle
          >
          <DialogDescription class="text-control-muted text-body-sm" data-part="description"
            >{description}</DialogDescription
          >
        </div>
      </div>

      <div
        class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain editor-dialog-tabs:p-md md:editor-dialog-tabs:px-editor-dialog-wide-inline md:editor-dialog-tabs:pt-lg md:editor-dialog-tabs:pb-editor-dialog-wide-inline editor-dialog-fill:min-h-full editor-dialog-fill:grow editor-dialog-fill:shrink-0 editor-dialog-fill:basis-auto editor-dialog-form:flex editor-dialog-form:flex-col editor-dialog-settings:flex editor-dialog-settings:flex-col editor-dialog-settings-child:shrink-0 editor-dialog-actions:sticky editor-dialog-actions:z-2 editor-dialog-actions:bottom-0 editor-dialog-actions:mt-auto editor-dialog-actions:bg-editor-dialog-actions-surface editor-dialog-actions:pb-editor-dialog-actions editor-dialog-actions:backdrop-blur-editor-dialog-actions"
        data-part="content"
      >
        {@render content()}
      </div>
    </div>
  {/snippet}
</DialogPrimitive>
