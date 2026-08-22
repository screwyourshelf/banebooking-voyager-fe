<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";
  import type {
    RichTextEditorAccessibility,
    RichTextEditorController,
  } from "./rich-text-editor-controller";

  let {
    disabled = false,
    label = "Rikteksteditor",
    onChange,
    onError,
    onReady,
    onStateChange,
    pending = false,
    value = "",
  }: {
    disabled?: boolean;
    label?: string;
    onChange: (value: string) => void;
    onError: (error: Error) => void;
    onReady: (controller: RichTextEditorController) => void;
    onStateChange: () => void;
    pending?: boolean;
    value?: string;
  } = $props();

  const formControl = getOptionalFormControlContext();
  const accessibility = $derived<RichTextEditorAccessibility>({
    describedBy: mergeAriaIds(formControl?.descriptionId, formControl?.errorId),
    id: formControl?.controlId,
    invalid: formControl?.invalid ?? false,
    label,
    labelledBy: formControl?.labelId,
    required: formControl?.required ?? false,
  });
  const editable = $derived(!disabled && !pending);

  let controller = $state.raw<RichTextEditorController>();
  let mount = $state<HTMLElement>();

  onMount(() => {
    let disposed = false;

    void import("./create-rich-text-editor.client")
      .then(({ createRichTextEditor }) => {
        if (disposed || !mount) return;
        const createdController = createRichTextEditor({
          accessibility,
          editable,
          mount,
          onChange,
          onStateChange,
          value,
        });
        controller = createdController;
        onReady(createdController);
      })
      .catch((error: unknown) => {
        onError(error instanceof Error ? error : new Error("Teksteditoren kunne ikke startes."));
      });

    return () => {
      disposed = true;
      controller?.destroy();
    };
  });

  $effect(() => {
    const nextValue = value;
    untrack(() => {
      try {
        controller?.setContent(nextValue);
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Tekstinnholdet kunne ikke åpnes."));
      }
    });
  });
  $effect(() => {
    const nextEditable = editable;
    untrack(() => controller?.setEditable(nextEditable));
  });
  $effect(() => {
    const nextAccessibility = accessibility;
    untrack(() => controller?.setAccessibility(nextAccessibility));
  });
</script>

<div bind:this={mount} data-ui-primitive="rich-text-editor-content"></div>
