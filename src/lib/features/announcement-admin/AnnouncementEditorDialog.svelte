<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { tick } from "svelte";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    DatePicker,
    EditorDialog,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    RichTextEditor,
    SettingsSection,
    SettingsStack,
  } from "$lib/ui";
  import {
    createAnnouncementDraft,
    MAX_ANNOUNCEMENT_TITLE_LENGTH,
    nextLocalIsoDate,
    toCreateAnnouncementRequest,
    validateAnnouncementDraft,
  } from "./model";
  import { createAnnouncementMutationOptions } from "./queries";

  let { onClose }: { onClose: () => void } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const mutation = createMutation(() =>
    createAnnouncementMutationOptions(api, queryClient, tenant.slug)
  );
  let open = $state(true);
  let draft = $state(createAnnouncementDraft());
  let attempted = $state(false);
  const errors = $derived(
    attempted ? validateAnnouncementDraft(draft) : { title: null, content: null, expiresOn: null }
  );
  const minimumExpiry = nextLocalIsoDate();

  function close() {
    open = false;
    onClose();
  }

  async function submit(form: HTMLFormElement) {
    attempted = true;
    const request = toCreateAnnouncementRequest(draft);
    if (!request) {
      await tick();
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    try {
      await mutation.mutateAsync(request);
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
  backLabel="Alle kunngjøringer"
  eyebrow="Ny kunngjøring"
  title="Opprett kunngjøring"
  description="Publiser informasjon som brukerne må lese og bekrefte."
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
        eyebrow="Innhold"
        title="Budskap til medlemmene"
        description="Kunngjøringen sperrer videre bruk av appen til den er bekreftet."
      >
        <FormFields>
          <FormField
            label="Tittel"
            description="Kort overskrift for kunngjøringen."
            error={errors.title}
            required
          >
            <Input
              name="tittel"
              placeholder="Viktig informasjon"
              maxlength={MAX_ANNOUNCEMENT_TITLE_LENGTH}
              bind:value={draft.title}
              disabled={mutation.isPending}
              oninput={() => mutation.reset()}
            />
          </FormField>

          <FormField
            label="Budskap"
            description="Formater innholdet brukerne må bekrefte."
            error={errors.content}
            required
          >
            <RichTextEditor
              name="tekst"
              bind:value={draft.content}
              pending={mutation.isPending}
              onValueChange={() => mutation.reset()}
            />
          </FormField>

          <FormField
            label="Utløpsdato"
            description="Kunngjøringen deaktiveres ved starten av denne datoen."
            error={errors.expiresOn}
            required
          >
            <DatePicker
              name="utløperTidspunkt"
              aria-label="Velg utløpsdato"
              minValue={minimumExpiry}
              bind:value={draft.expiresOn}
              pending={mutation.isPending}
              onValueChange={() => mutation.reset()}
            />
          </FormField>
        </FormFields>
      </SettingsSection>

      <FormActions>
        {#if mutation.isError}
          <Feedback
            tone="danger"
            title="Kunngjøringen kunne ikke publiseres"
            description={mutation.error instanceof Error ? mutation.error.message : "Prøv igjen."}
          />
        {/if}
        <FormSubmit pending={mutation.isPending} pendingLabel="Publiserer …">
          Publiser kunngjøring
        </FormSubmit>
      </FormActions>
    </SettingsStack>
  </Form>
</EditorDialog>
