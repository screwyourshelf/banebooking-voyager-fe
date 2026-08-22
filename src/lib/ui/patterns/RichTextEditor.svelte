<script lang="ts">
  import Button from "../primitives/Button.svelte";
  import RichTextEditorPrimitive from "../primitives/RichTextEditorPrimitive.svelte";
  import type {
    RichTextEditorCommand,
    RichTextEditorController,
  } from "../primitives/rich-text-editor-controller";
  import RichTextEditorToolbar from "./RichTextEditorToolbar.svelte";

  type EditorStatus = "error" | "loading" | "ready";

  let {
    disabled = false,
    label = "Rikteksteditor",
    name,
    onError,
    onValueChange,
    pending = false,
    value = $bindable(""),
  }: {
    disabled?: boolean;
    label?: string;
    name?: string;
    onError?: (error: Error) => void;
    onValueChange?: (value: string) => void;
    pending?: boolean;
    value?: string;
  } = $props();

  let attempt = $state(0);
  let controller = $state.raw<RichTextEditorController>();
  let editorRevision = $state(0);
  let error = $state<Error>();
  let status = $state<EditorStatus>("loading");

  const locked = $derived(disabled || pending || status !== "ready");
  const editorState = $derived(
    pending ? "pending" : disabled ? "disabled" : status === "error" ? "error" : status
  );
  const retryable = $derived(error?.name !== "InvalidRichTextContentError");

  function change(nextValue: string): void {
    value = nextValue;
    onValueChange?.(nextValue);
  }

  function editorError(nextError: Error): void {
    controller = undefined;
    error = nextError;
    status = "error";
    onError?.(nextError);
  }

  function ready(nextController: RichTextEditorController): void {
    controller = nextController;
    error = undefined;
    status = "ready";
    editorRevision += 1;
  }

  function retry(): void {
    controller = undefined;
    error = undefined;
    status = "loading";
    attempt += 1;
  }

  function run(command: RichTextEditorCommand): void {
    if (locked) return;
    controller?.run(command);
    editorRevision += 1;
  }
</script>

<div data-ui="editor" data-state={editorState} aria-busy={pending || status === "loading"}>
  <RichTextEditorToolbar {controller} disabled={locked} onCommand={run} revision={editorRevision} />

  {#if status === "loading"}
    <div data-part="loading" role="status">Laster teksteditor…</div>
  {:else if status === "error"}
    <div data-part="error" role="alert">
      <strong>Teksteditoren kunne ikke åpnes</strong>
      <span>{error?.message ?? "Prøv å laste editoren på nytt."}</span>
      {#if retryable}
        <Button variant="secondary" size="small" onclick={retry}>Prøv igjen</Button>
      {/if}
    </div>
  {/if}

  {#key attempt}
    <div data-part="content" hidden={status !== "ready"}>
      <RichTextEditorPrimitive
        {disabled}
        {label}
        {pending}
        {value}
        onChange={change}
        onError={editorError}
        onReady={ready}
        onStateChange={() => (editorRevision += 1)}
      />
    </div>
  {/key}

  {#if name}
    <input type="hidden" {name} {value} />
  {/if}
</div>
