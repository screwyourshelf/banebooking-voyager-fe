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
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay data-ui-primitive="dialog-overlay" />
    <Dialog.Content
      data-ui-primitive="dialog-surface"
      data-size={size}
      aria-busy={pending || undefined}
      escapeKeydownBehavior={pending ? "ignore" : "close"}
      interactOutsideBehavior={pending ? "ignore" : "close"}
    >
      {@render children({ close })}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
