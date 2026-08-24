<script lang="ts" module>
  export type DialogPrimitiveSize = "editor" | "standard";
  export type DialogPrimitiveControls = {
    close: () => void;
  };
</script>

<script lang="ts">
  import { Dialog } from "bits-ui";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet<[DialogPrimitiveControls]>;
    onClose?: () => void;
    open?: boolean;
    pending?: boolean;
    size: DialogPrimitiveSize;
  };

  let { children, onClose, open = $bindable(false), pending = false, size }: Props = $props();

  function close() {
    if (pending) return;
    open = false;
    onClose?.();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) return;

    if (pending) {
      open = true;
      return;
    }

    onClose?.();
  }

  // Flaten har ingen exit-transition; umiddelbar gjenoppretting unngår en hengende global
  // body-scroll-cleanup etter at dialogtreet er avmontert.
  const restoreScrollDelay = 0;
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="fixed z-80 inset-0 bg-dialog-overlay backdrop-blur-dialog-overlay"
      data-ui-primitive="dialog-overlay"
    />
    <Dialog.Content
      class={[
        "fixed z-81 flex min-w-0 overflow-hidden bg-surface shadow-surface-lg outline-none",
        size === "standard"
          ? "top-dialog-surface-top bottom-dialog-surface-bottom left-1/2 w-dialog-surface max-h-dialog-surface translate-x-dialog-surface-translate-x translate-y-dialog-surface-translate-y border-x border-t border-b-dialog-surface border-dialog-border rounded-dialog-surface pb-dialog-surface-padding-bottom"
          : "inset-0 w-screen h-dvh max-h-none border-0 rounded-none md:inset-auto md:top-1/2 md:left-1/2 md:w-editor-dialog md:h-editor-dialog md:max-h-editor-dialog md:-translate-x-1/2 md:-translate-y-1/2 md:border md:border-dialog-border md:rounded-dialog",
      ]}
      data-ui-primitive="dialog-surface"
      data-size={size}
      aria-busy={pending || undefined}
      escapeKeydownBehavior={pending ? "ignore" : "close"}
      interactOutsideBehavior={pending ? "ignore" : "close"}
      {restoreScrollDelay}
    >
      {@render children({ close })}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
