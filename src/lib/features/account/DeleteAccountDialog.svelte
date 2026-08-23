<script lang="ts">
  import { createMutation } from "@tanstack/svelte-query";
  import { getApiClient } from "$lib/platform/api";
  import { getAuthContext } from "$lib/platform/auth";
  import { getTenantContext } from "$lib/platform/tenant";
  import { Button, Dialog, Feedback, type DialogActionContext } from "$lib/ui";
  import { deleteMyAccountMutationOptions } from "./queries";

  let { disabled = false }: { disabled?: boolean } = $props();

  const api = getApiClient();
  const auth = getAuthContext();
  const tenant = getTenantContext();
  let open = $state(false);
  const deletion = createMutation(() => deleteMyAccountMutationOptions(api, tenant.slug));

  async function confirmDeletion() {
    if (deletion.isPending) return;
    try {
      await deletion.mutateAsync();
      open = false;
      await auth.signOut();
    } catch {
      // Mutasjonen beholder feilen i den fokuserte dialogen.
    }
  }
</script>

<Button
  variant="destructive"
  disabled={disabled || deletion.isPending}
  onclick={() => {
    deletion.reset();
    open = true;
  }}
>
  {deletion.isPending ? "Sletter …" : "Slett kontoen min"}
</Button>

{#snippet actions({ close, pending }: DialogActionContext)}
  <Button variant="secondary" disabled={pending} onclick={close}>Avbryt</Button>
  <Button variant="destructive" disabled={pending} onclick={confirmDeletion}>
    {pending ? "Sletter …" : "Slett konto"}
  </Button>
{/snippet}

<Dialog
  bind:open
  title="Slett kontoen?"
  description="Dette sletter kontoen og alle tilknyttede data permanent. Handlingen kan ikke angres."
  pending={deletion.isPending}
  {actions}
  onClose={() => deletion.reset()}
>
  {#if deletion.isError}
    <Feedback
      tone="danger"
      title="Kontoen kunne ikke slettes"
      description={deletion.error instanceof Error ? deletion.error.message : "Prøv igjen om litt."}
    />
  {:else}
    <p>Du blir logget ut når kontoen er slettet.</p>
  {/if}
</Dialog>
