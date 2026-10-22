<script lang="ts">
  import type { KalenderSlotRespons } from "$lib/contracts";
  import { Button, Dialog, Feedback } from "$lib/ui";

  let {
    open = $bindable(false),
    slot,
    pending = false,
    error,
    onConfirm,
  }: {
    open?: boolean;
    slot: KalenderSlotRespons | null;
    pending?: boolean;
    error?: string | null;
    onConfirm: () => Promise<unknown>;
  } = $props();

  async function confirm() {
    try {
      await onConfirm();
      open = false;
    } catch {
      // Behold bekreftelsen og vis API-ets avvisning.
    }
  }
</script>

{#snippet actions({ close }: { close: () => void })}
  <Button variant="secondary" disabled={pending} onclick={close}>Behold tiden</Button>
  <Button variant="destructive" disabled={pending} onclick={() => void confirm()}>
    {pending ? "Avlyser …" : "Ja, avlys"}
  </Button>
{/snippet}

<Dialog
  bind:open
  title="Avlys banetid"
  description={`Avlys tiden for «${slot?.arrangementTittel ?? "arrangementet"}»?`}
  {pending}
  {actions}
>
  <p>Dette er arrangementets siste tid. Arrangementet slettes også.</p>
  {#if error}
    <Feedback tone="danger" title="Tiden kunne ikke avlyses" description={error} />
  {/if}
</Dialog>
