<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import type { BrukerRespons } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import { Button, Dialog, Feedback } from "$lib/ui";
  import { deleteUserMutationOptions } from "./queries";

  let { onClose, user }: { onClose: () => void; user: BrukerRespons } = $props();
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() => deleteUserMutationOptions(api, queryClient, tenant.slug));
  let open = $state(true);

  function close() {
    open = false;
    onClose();
  }

  async function confirmDelete() {
    try {
      await mutation.mutateAsync(user.id);
      close();
    } catch {
      // Den normaliserte mutationfeilen beholdes i bekreftelsen.
    }
  }
</script>

{#snippet actions()}
  <Button variant="secondary" disabled={mutation.isPending} onclick={close}>Avbryt</Button>
  <Button variant="destructive" disabled={mutation.isPending} onclick={() => void confirmDelete()}>
    {mutation.isPending ? "Sletter …" : "Slett bruker"}
  </Button>
{/snippet}

<Dialog
  bind:open
  pending={mutation.isPending}
  {onClose}
  title="Slett bruker?"
  description="Denne handlingen kan ikke angres."
  {actions}
>
  <p>
    Dette vil slette brukeren <strong>{user.epost}</strong> og all tilknyttet data permanent.
  </p>
  {#if mutation.isError}
    <Feedback
      tone="danger"
      title="Kunne ikke slette brukeren"
      description={mutation.error instanceof Error ? mutation.error.message : undefined}
    />
  {/if}
</Dialog>
