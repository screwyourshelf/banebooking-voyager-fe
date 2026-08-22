<script lang="ts">
  import { Button, Dialog, EditorDialog, Input } from "$lib/ui";

  let {
    onEditorClose,
    onSave,
    onStandardClose,
    pending = false,
  }: {
    onEditorClose: () => void;
    onSave: () => void;
    onStandardClose: () => void;
    pending?: boolean;
  } = $props();

  let editorOpen = $state(false);
  let standardOpen = $state(false);
</script>

<Button onclick={() => (standardOpen = true)}>Vis bookingregler</Button>
<Button onclick={() => (editorOpen = true)} variant="secondary">Rediger bruker</Button>

<Dialog
  bind:open={standardOpen}
  title="Bookingregler"
  description="Grenser, tider og varighet som gjelder når du booker."
  onClose={onStandardClose}
  {pending}
>
  <p>Du kan booke opptil to tider per dag.</p>

  {#snippet actions({ close, pending: actionPending })}
    <Button disabled={actionPending} onclick={close} variant="secondary">Avbryt</Button>
    <Button disabled={actionPending} onclick={onSave}>Lagre</Button>
  {/snippet}
</Dialog>

<EditorDialog
  bind:open={editorOpen}
  backLabel="Alle brukere"
  eyebrow="Bruker"
  title="Rediger bruker"
  description="kari@example.no"
  onClose={onEditorClose}
  {pending}
>
  <label for="dialog-name">Visningsnavn</label>
  <Input id="dialog-name" value="Kari Nordmann" />
  <Button disabled={pending} onclick={onSave}>Lagre bruker</Button>
</EditorDialog>
