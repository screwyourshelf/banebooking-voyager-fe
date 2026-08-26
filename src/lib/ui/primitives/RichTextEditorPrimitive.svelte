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

<div
  class={[
    "min-w-0 rich-text-root:min-w-0 rich-text-root:min-h-rich-text-editor rich-text-root:p-md rich-text-root:text-ink rich-text-root:outline-none rich-text-root:leading-rich-text-content",
    "rich-text-child:min-w-0 rich-text-flow:mt-rich-text-flow",
    "rich-text-heading-2:text-heading-md rich-text-heading-2:font-rich-text-heading-2 rich-text-heading-2:leading-rich-text-heading-2",
    "rich-text-heading-3:text-heading-sm rich-text-heading-3:font-rich-text-heading-3 rich-text-heading-3:leading-rich-text-heading-3",
    "rich-text-bullet-list:pl-rich-text-list rich-text-bullet-list:list-disc rich-text-ordered-list:pl-rich-text-list rich-text-ordered-list:list-decimal rich-text-list-item-flow:mt-rich-text-list-item",
    "rich-text-quote:border-l-rich-text-quote rich-text-quote:border-line-strong rich-text-quote:pl-rich-text-quote rich-text-quote:text-ink-soft rich-text-quote:italic",
    "rich-text-link:text-brand rich-text-link:underline rich-text-link:underline-offset-rich-text-link rich-text-strong:font-rich-text-strong rich-text-emphasis:italic",
    "rich-text-table:w-full rich-text-table:min-w-rich-text-table rich-text-table:my-sm rich-text-table:border-collapse rich-text-table:text-label",
    "rich-text-table-cell:min-w-rich-text-table-cell rich-text-table-cell:border rich-text-table-cell:border-line rich-text-table-cell:px-md rich-text-table-cell:py-sm rich-text-table-cell:text-left rich-text-table-cell:align-top",
    "rich-text-table-heading:bg-surface-subtle rich-text-table-heading:font-rich-text-table-heading rich-text-selected-cell:bg-accent-soft",
  ]}
  bind:this={mount}
  data-ui-primitive="rich-text-editor-content"
></div>
