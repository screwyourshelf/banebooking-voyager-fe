<script lang="ts">
  import type { UlestKunngjøringRespons } from "#lib/contracts/index.ts";
  import { getApiClient } from "#lib/platform/api/index.ts";
  import { getTenantContext } from "#lib/platform/tenant/index.ts";
  import {
    Document,
    DocumentIntro,
    Feedback,
    Form,
    FormActions,
    FormSubmit,
    Page,
    RichTextContent,
  } from "#lib/ui/index.ts";
  import { createMutation } from "@tanstack/svelte-query";
  import { confirmRequiredAnnouncement } from "./api";

  let {
    announcement,
    onConfirmed,
  }: {
    announcement: UlestKunngjøringRespons;
    onConfirmed: () => Promise<unknown>;
  } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const confirmation = createMutation(() => ({
    mutationFn: () => confirmRequiredAnnouncement(api, tenant.slug, announcement.id),
    onSuccess: onConfirmed,
    retry: false,
  }));

  const errorMessage = $derived(
    confirmation.error instanceof Error
      ? confirmation.error.message
      : "Kunngjøringen kunne ikke markeres som lest."
  );

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (confirmation.isPending) return;
    void confirmation.mutateAsync().catch(() => undefined);
  }
</script>

<Page eyebrow="Fra klubben" title={announcement.tittel}>
  <Document label="Kunngjøring">
    <DocumentIntro><RichTextContent value={announcement.tekst} /></DocumentIntro>

    <Form onsubmit={submit} pending={confirmation.isPending}>
      <FormActions>
        {#if confirmation.isError}
          <Feedback
            tone="danger"
            title="Kunne ikke markere kunngjøringen som lest"
            description={errorMessage}
          />
        {/if}
        <FormSubmit pending={confirmation.isPending} pendingLabel="Registrerer …">
          Ok, fått det med meg
        </FormSubmit>
      </FormActions>
    </Form>
  </Document>
</Page>
