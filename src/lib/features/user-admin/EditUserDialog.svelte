<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { tick, untrack } from "svelte";
  import type { BrukerRespons, RolleType } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    EditorDialog,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    Select,
    SettingsSection,
    SettingsStack,
  } from "$lib/ui";
  import {
    ROLE_OPTIONS,
    toUserUpdateRequest,
    userToEditDraft,
    validateUserEditDraft,
  } from "./model";
  import { updateUserMutationOptions } from "./queries";

  let { onClose, user }: { onClose: () => void; user: BrukerRespons } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() => updateUserMutationOptions(api, queryClient, tenant.slug));
  let open = $state(true);
  let draft = $state(userToEditDraft(untrack(() => user)));
  let attempted = $state(false);
  const errors = $derived(attempted ? validateUserEditDraft(draft) : { displayName: null });

  function close() {
    open = false;
    onClose();
  }

  async function submit(formElement: HTMLFormElement) {
    attempted = true;
    const validation = validateUserEditDraft(draft);
    if (validation.displayName) {
      await tick();
      formElement.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    try {
      await mutation.mutateAsync({ userId: user.id, request: toUserUpdateRequest(draft) });
      close();
    } catch {
      // Den normaliserte mutationfeilen beholdes i editoren.
    }
  }
</script>

<EditorDialog
  bind:open
  pending={mutation.isPending}
  {onClose}
  backLabel="Alle brukere"
  eyebrow="Bruker"
  title="Rediger bruker"
  description={user.epost}
>
  <Form
    variant="editor"
    pending={mutation.isPending}
    onsubmit={(event) => {
      event.preventDefault();
      void submit(event.currentTarget);
    }}
  >
    <SettingsStack embedded>
      <SettingsSection
        embedded
        eyebrow="Profil og tilgang"
        title={user.visningsnavn || "Bruker uten visningsnavn"}
        description="Oppdater navnet som vises i klubben og hvilken tilgang brukeren har."
      >
        <FormFields>
          <FormField
            label="Visningsnavn"
            description="Valgfritt, 2–100 tegn når det fylles ut."
            error={errors.displayName}
          >
            <Input
              value={draft.displayName}
              maxlength={100}
              disabled={mutation.isPending}
              oninput={(event) => (draft = { ...draft, displayName: event.currentTarget.value })}
            />
          </FormField>
          <FormField
            label="Rolle"
            description="Rollen styrer hvilke deler av administrasjonen brukeren kan åpne."
            required
          >
            <Select
              value={draft.role}
              options={ROLE_OPTIONS}
              disabled={mutation.isPending}
              onValueChange={(role) => (draft = { ...draft, role: role as RolleType })}
            />
          </FormField>
        </FormFields>
      </SettingsSection>

      <FormActions>
        {#if mutation.isError}
          <Feedback
            tone="danger"
            title="Kunne ikke lagre brukeren"
            description={mutation.error instanceof Error ? mutation.error.message : undefined}
          />
        {/if}
        <Button variant="secondary" disabled={mutation.isPending} onclick={close}>Avbryt</Button>
        <FormSubmit pending={mutation.isPending}>Lagre</FormSubmit>
      </FormActions>
    </SettingsStack>
  </Form>
</EditorDialog>
