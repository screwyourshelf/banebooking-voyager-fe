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
      : "Bekreftelsen kunne ikke lagres."
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
  title="Bekreft medlemskapet ditt"
  description="Bekreft hvilket medlemskap du er omfattet av før du booker."
  actions={membershipStatus}
>
  <Document label="Medlemskapsbekreftelse">
    <DocumentIntro>
      <p>
        Før du booker, ber vi deg bekrefte at du er omfattet av et gyldig medlemskap i
        <strong>{klubb.navn}</strong>. Banebooking er ikke koblet til klubbens medlemsregister og
        kontrollerer derfor ikke medlemskapet automatisk.
      </p>
      <p>
        Har du familiemedlemskap? Velg «Familiemedlemskap» og oppgi ditt eget navn. Hver person som
        logger inn, bekrefter fra sin egen konto.
      </p>
      <p>
        Vi ber deg også passe på at personer du booker for, er omfattet av et gyldig medlemskap.
      </p>
      {#if klubb.nettside}
        <p>
          Usikker på medlemskapet ditt, eller ikke medlem ennå?
          <a href={klubb.nettside} target="_blank" rel="external noopener noreferrer">
            Les om medlemskap og priser på klubbens nettside
          </a>.
        </p>
      {/if}
      <p>
        Når du fortsetter, bekrefter du at opplysningene er riktige og godtar
        <a href={resolve(termsHref)}>vilkårene for bruk</a>.
      </p>
    </DocumentIntro>

    <Form onsubmit={submit} pending={confirmation.isPending}>
      <SettingsSection
        eyebrow="Påkrevd"
        title="Om medlemskapet ditt"
        description="Klubben kan se opplysningene du oppgir her."
        embedded
      >
        <FormFields>
          <FormField
            label="Ditt fulle navn"
            description="Oppgi ditt eget navn, også når du er del av et familiemedlemskap."
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
            description="Velg medlemskapet du er omfattet av."
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
              title="Kunne ikke lagre bekreftelsen"
              description={mutationErrorMessage}
            />
          {/if}
          <FormSubmit pending={confirmation.isPending} pendingLabel="Lagrer …">
            Bekreft og fortsett
          </FormSubmit>
        </FormActions>
      </SettingsSection>
    </Form>
  </Document>
</Page>
