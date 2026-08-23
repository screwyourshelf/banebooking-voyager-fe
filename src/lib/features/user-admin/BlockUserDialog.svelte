<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { tick } from "svelte";
  import type { BrukerRespons } from "$lib/contracts";
  import { tilDatoTekst } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    DatePicker,
    EditorDialog,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    SettingsSection,
    SettingsStack,
    Textarea,
  } from "$lib/ui";
  import { createUserBlockDraft, toUserBlockRequest, validateUserBlockDraft } from "./model";
  import { blockUserMutationOptions } from "./queries";

  let { onClose, user }: { onClose: () => void; user: BrukerRespons } = $props();
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() => blockUserMutationOptions(api, queryClient, tenant.slug));
  let open = $state(true);
  let draft = $state(createUserBlockDraft());
  let attempted = $state(false);
  const errors = $derived(attempted ? validateUserBlockDraft(draft) : { reason: null });

  function close() {
    open = false;
    onClose();
  }

  async function submit(formElement: HTMLFormElement) {
    attempted = true;
    const validation = validateUserBlockDraft(draft);
    if (validation.reason) {
      await tick();
      formElement.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    try {
      await mutation.mutateAsync({ userId: user.id, request: toUserBlockRequest(draft) });
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
  backLabel="Til brukeren"
  eyebrow="Tilgang"
  title="Sperr bruker"
  description={`Sperr ${user.epost} fra booking og arrangementer.`}
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
        tone="danger"
        eyebrow="Sperring"
        title="Begrunn og avgrens sperringen"
        description="Uten utløpsdato gjelder sperringen til en administrator opphever den."
      >
        <FormFields>
          <FormField
            label="Årsak"
            description="Mellom 3 og 500 tegn."
            error={errors.reason}
            required
          >
            <Textarea
              value={draft.reason}
              maxlength={500}
              rows={4}
              disabled={mutation.isPending}
              oninput={(event) => (draft = { ...draft, reason: event.currentTarget.value })}
            />
          </FormField>
          <FormField label="Aktiv til" description="Valgfri utløpsdato.">
            <DatePicker
              value={draft.expiresOn}
              minValue={tilDatoTekst(new Date())}
              disabled={mutation.isPending}
              onValueChange={(expiresOn) => (draft = { ...draft, expiresOn })}
            />
            {#if draft.expiresOn}
              <Button
                size="small"
                variant="ghost"
                disabled={mutation.isPending}
                onclick={() => (draft = { ...draft, expiresOn: "" })}>Fjern utløpsdato</Button
              >
            {/if}
          </FormField>
        </FormFields>
      </SettingsSection>

      <FormActions>
        {#if mutation.isError}
          <Feedback
            tone="danger"
            title="Kunne ikke sperre brukeren"
            description={mutation.error instanceof Error ? mutation.error.message : undefined}
          />
        {/if}
        <Button variant="secondary" disabled={mutation.isPending} onclick={close}>Avbryt</Button>
        <FormSubmit variant="destructive" pending={mutation.isPending} pendingLabel="Sperrer …">
          Sperr bruker
        </FormSubmit>
      </FormActions>
    </SettingsStack>
  </Form>
</EditorDialog>
