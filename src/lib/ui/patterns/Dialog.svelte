<script lang="ts" module>
  export type DialogActionContext = {
    close: () => void;
    pending: boolean;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";
  import Button from "../primitives/Button.svelte";
  import DialogDescription from "../primitives/DialogDescription.svelte";
  import DialogPrimitive from "../primitives/DialogPrimitive.svelte";
  import DialogTitle from "../primitives/DialogTitle.svelte";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children" | "title"> & {
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
    <div
      {...attributes}
      class="flex w-full max-h-none flex-col gap-0 overflow-hidden rounded-dialog bg-surface p-0"
      data-ui="dialog"
      data-state={pending ? "pending" : "ready"}
    >
      <div
        class="flex items-start justify-between gap-lg px-dialog-inline pt-dialog-inline pb-md dialog-close:flex-none dialog-close:-mt-dialog-close-offset dialog-close:-mr-dialog-close-offset dialog-close:text-dialog-close dialog-close:leading-dialog-close"
        data-part="header"
      >
        <div class="grid min-w-0 gap-dialog-intro" data-part="intro">
          <DialogTitle
            class="text-ink font-display text-heading-sm font-dialog-title leading-dialog-title"
            data-part="title">{title}</DialogTitle
          >
          {#if description}
            <DialogDescription
              class="text-ink-soft text-body-sm leading-dialog-description"
              data-part="description">{description}</DialogDescription
            >
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

      <div
        class="flex min-h-0 flex-col gap-lg overflow-y-auto px-dialog-inline pt-md pb-dialog-inline"
        data-part="content"
      >
        {@render content()}
      </div>

      {#if actions}
        <div
          class="flex flex-wrap justify-end gap-dialog-actions border-t border-line px-dialog-inline py-lg"
          data-part="actions"
        >
          {@render actions({ close, pending })}
        </div>
      {/if}
    </div>
  {/snippet}
</DialogPrimitive>
