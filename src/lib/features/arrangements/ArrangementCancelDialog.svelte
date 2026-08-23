<script lang="ts">
  import { Button, Dialog, Feedback, type DialogActionContext } from "$lib/ui";

  let {
    error,
    onCancel,
    onPrepare,
    onReset,
    pending = false,
    title,
  }: {
    error?: string | null;
    onCancel: () => Promise<unknown>;
    onPrepare: () => void;
    onReset: () => void;
    pending?: boolean;
    title: string;
  } = $props();

  let open = $state(false);

  async function confirmCancellation() {
    if (pending) return;
    try {
      await onCancel();
      open = false;
    } catch {
      // Mutasjonsfeilen forblir synlig i dialogens lokale kontekst.
    }
  }

  function prepareCancellation() {
    onPrepare();
    open = true;
  }
</script>

<Button variant="destructive" size="small" disabled={pending} onclick={prepareCancellation}>
  Avlys
</Button>

{#snippet actions({ close, pending: dialogPending }: DialogActionContext)}
  <Button variant="secondary" disabled={dialogPending} onclick={close}>Avbryt</Button>
  <Button variant="destructive" disabled={dialogPending} onclick={() => void confirmCancellation()}>
    {dialogPending ? "Avlyser …" : "Ja, avlys"}
  </Button>
{/snippet}

<Dialog
  bind:open
  title="Avlys arrangement"
  description={`Er du sikker på at du vil avlyse «${title}»? Alle tilknyttede banetider slettes.`}
  {actions}
  {pending}
  onClose={onReset}
>
  {#if error}
    <Feedback tone="danger" title="Arrangementet kunne ikke avlyses" description={error} />
  {:else}
    <p>Handlingen kan ikke angres.</p>
  {/if}
</Dialog>
