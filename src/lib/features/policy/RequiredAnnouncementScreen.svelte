<script lang="ts">
  import type { UlestKunngjøringRespons } from "$lib/contracts";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Document,
    DocumentIntro,
    Feedback,
    Form,
    FormActions,
    FormSubmit,
    Page,
    PageStatus,
    RichTextContent,
  } from "$lib/ui";
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
      : "Kunngjøringen kunne ikke bekreftes."
  );

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (confirmation.isPending) return;
    void confirmation.mutateAsync().catch(() => undefined);
  }
</script>

{#snippet confirmationStatus()}
  <PageStatus label="Må bekreftes" tone="warning" />
{/snippet}

<Page
  eyebrow="Fra klubben"
  title={announcement.tittel}
  description="Les og bekreft før du går videre."
  actions={confirmationStatus}
>
  <Document label="Obligatorisk kunngjøring">
    <DocumentIntro><RichTextContent value={announcement.tekst} /></DocumentIntro>

    <Form onsubmit={submit} pending={confirmation.isPending}>
      <FormActions>
        {#if confirmation.isError}
          <Feedback
            tone="danger"
            title="Kunne ikke bekrefte kunngjøringen"
            description={errorMessage}
          />
        {/if}
        <FormSubmit pending={confirmation.isPending} pendingLabel="Bekrefter …">
          Jeg har lest kunngjøringen
        </FormSubmit>
      </FormActions>
    </Form>
  </Document>
</Page>
