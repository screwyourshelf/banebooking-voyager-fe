<script lang="ts">
  import { resolve } from "$app/paths";
  import type { BrukerRespons, KlubbRespons } from "$lib/contracts";
  import { MEDLEMSKAP_TYPE_VALG } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Document,
    DocumentIntro,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    Page,
    PageStatus,
    SettingsRadioGroup,
    SettingsSection,
  } from "$lib/ui";
  import { createMutation } from "@tanstack/svelte-query";
  import { confirmMembership } from "./api";
  import {
    toMembershipConfirmationRequest,
    validateMembershipConfirmation,
  } from "./membership-confirmation-model";

  let {
    bruker,
    klubb,
    onConfirmed,
    termsHref,
  }: {
    bruker: BrukerRespons;
    klubb: KlubbRespons;
    onConfirmed: () => Promise<unknown>;
    termsHref: string;
  } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  let fullName = $state("");
  let membershipType = $state("");
  let submitted = $state(false);
  const draft = $derived({ fullName, membershipType });
  const validationErrors = $derived(validateMembershipConfirmation(draft));
  const visibleErrors = $derived(
    submitted ? validationErrors : { fullName: null, membershipType: null }
  );

  const confirmation = createMutation(() => ({
    mutationFn: confirmMembership.bind(null, api, tenant.slug),
    onSuccess: onConfirmed,
    retry: false,
  }));
  const mutationErrorMessage = $derived(
    confirmation.error instanceof Error
      ? confirmation.error.message
      : "Medlemskapet kunne ikke bekreftes."
  );

  function submit(event: SubmitEvent) {
    event.preventDefault();
    if (confirmation.isPending) return;

    submitted = true;
    const request = toMembershipConfirmationRequest(draft);
    if (!request) {
      const form = event.currentTarget as HTMLFormElement;
      const firstInvalid = validationErrors.fullName
        ? form.elements.namedItem("fulltNavn")
        : form.elements.namedItem("medlemskapType");
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      return;
    }

    void confirmation.mutateAsync(request).catch(() => undefined);
  }
</script>

{#snippet membershipStatus()}
  <PageStatus label={bruker.medlemskapBekreftelseLabel ?? "Må bekreftes"} tone="warning" />
{/snippet}

<Page
  eyebrow="Medlemskap"
  title="Bekreft medlemskap"
  description="Oppgi medlemskapstype og navnet medlemskapet står på."
  actions={membershipStatus}
>
  <Document label="Medlemskapsbekreftelse">
    <DocumentIntro>
      <p>
        For å booke baner må du være medlem av <strong>{klubb.navn}</strong>. Alle spillere du
        booker for, må også ha gyldig medlemskap.
      </p>
      {#if klubb.nettside}
        <p>
          Ikke medlem ennå?
          <a href={klubb.nettside} target="_blank" rel="external noopener noreferrer">
            Se medlemskap og priser på klubbens nettside
          </a>.
        </p>
      {/if}
      <p>Ved å bekrefte godtar du <a href={resolve(termsHref)}>vilkårene for bruk</a>.</p>
    </DocumentIntro>

    <Form onsubmit={submit} pending={confirmation.isPending}>
      <SettingsSection
        eyebrow="Påkrevd"
        title="Dine opplysninger"
        description="Opplysningene brukes til klubbens medlemsoversikt."
        embedded
      >
        <FormFields>
          <FormField
            label="Fullt navn"
            description="Skriv navnet medlemskapet står på."
            controlId="membership-full-name"
            error={visibleErrors.fullName}
            required
          >
            <Input
              name="fulltNavn"
              placeholder="Ola Nordmann"
              autocomplete="name"
              bind:value={fullName}
              disabled={confirmation.isPending}
            />
          </FormField>

          <FormField
            label="Medlemskapstype"
            description="Velg medlemskapet du har betalt."
            error={visibleErrors.membershipType}
            required
          >
            <SettingsRadioGroup
              label="Medlemskapstype"
              name="medlemskapType"
              options={MEDLEMSKAP_TYPE_VALG}
              value={membershipType}
              onValueChange={(value) => (membershipType = value)}
              pending={confirmation.isPending}
            />
          </FormField>
        </FormFields>

        <FormActions>
          {#if confirmation.isError}
            <Feedback
              tone="danger"
              title="Kunne ikke bekrefte medlemskapet"
              description={mutationErrorMessage}
            />
          {/if}
          <FormSubmit pending={confirmation.isPending} pendingLabel="Bekrefter …">
            Jeg bekrefter medlemskapet
          </FormSubmit>
        </FormActions>
      </SettingsSection>
    </Form>
  </Document>
</Page>
