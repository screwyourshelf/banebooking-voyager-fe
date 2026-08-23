<script lang="ts">
  import { createMutation } from "@tanstack/svelte-query";
  import type { BrukerRespons } from "$lib/contracts";
  import { formaterMedlemskapType, formaterRoller } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    Select,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsValue,
  } from "$lib/ui";
  import DeleteAccountDialog from "./DeleteAccountDialog.svelte";
  import {
    createDisplayNameDraft,
    MAX_DISPLAY_NAME_LENGTH,
    resolveDisplayName,
    type DisplayNameMode,
    validateDisplayName,
  } from "./model";
  import { updateMyProfileMutationOptions } from "./queries";

  let {
    onUserUpdated,
    user,
  }: {
    onUserUpdated: () => Promise<unknown>;
    user: BrukerRespons;
  } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  let synchronizedUser = $state("");
  let mode = $state<DisplayNameMode>("epost");
  let displayName = $state("");
  let submitted = $state(false);
  let displayNameTouched = $state(false);
  const validationError = $derived(mode === "navn" ? validateDisplayName(displayName) : null);
  const selectedDisplayName = $derived(resolveDisplayName(user, mode, displayName));
  const canSubmit = $derived(
    selectedDisplayName.length > 0 &&
      selectedDisplayName !== (user.visningsnavn ?? "").trim() &&
      !validationError
  );
  const update = createMutation(() =>
    updateMyProfileMutationOptions(api, tenant.slug, onUserUpdated)
  );

  $effect(() => {
    const signature = `${user.id}:${user.epost}:${user.visningsnavn}`;
    if (signature === synchronizedUser || update.isPending) return;
    const draft = createDisplayNameDraft(user);
    synchronizedUser = signature;
    mode = draft.mode;
    displayName = draft.value;
    submitted = false;
    displayNameTouched = false;
  });

  function changeMode(value: string) {
    mode = value === "navn" ? "navn" : "epost";
    submitted = false;
    displayNameTouched = false;
    update.reset();
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    submitted = true;
    if (!canSubmit || update.isPending) return;
    void update.mutateAsync({ visningsnavn: selectedDisplayName }).catch(() => undefined);
  }
</script>

<SettingsStack>
  <Form onsubmit={submit} pending={update.isPending}>
    <SettingsSection
      eyebrow="Profil"
      title="Slik vises du"
      description="Velg navnet andre ser i Banebooking."
      embedded
    >
      <FormFields>
        <FormField
          label="Visningsnavn"
          description="Bruk e-postadressen din eller skriv inn et eget navn."
        >
          <Select
            value={mode}
            options={[
              { value: "epost", label: "Bruk e-postadresse" },
              { value: "navn", label: "Bruk eget navn" },
            ]}
            aria-label="Type visningsnavn"
            pending={update.isPending}
            onValueChange={changeMode}
          />
        </FormField>

        {#if mode === "navn"}
          <FormField
            label="Eget navn"
            description={`Mellom 3 og ${MAX_DISPLAY_NAME_LENGTH} tegn.`}
            error={submitted || displayNameTouched ? validationError : null}
          >
            <Input
              name="visningsnavn"
              placeholder="For eksempel Ola Nordmann"
              maxlength={MAX_DISPLAY_NAME_LENGTH}
              autocomplete="name"
              bind:value={displayName}
              disabled={update.isPending}
              oninput={() => {
                displayNameTouched = true;
                update.reset();
              }}
            />
          </FormField>
        {/if}
      </FormFields>

      <FormActions>
        {#if update.isError}
          <Feedback
            tone="danger"
            title="Visningsnavnet kunne ikke lagres"
            description={update.error instanceof Error ? update.error.message : "Prøv igjen."}
          />
        {:else if update.isSuccess && !canSubmit}
          <Feedback tone="success" title="Visningsnavnet er lagret" />
        {/if}
        <FormSubmit pending={update.isPending} pendingLabel="Lagrer …" disabled={!canSubmit}>
          Lagre endringer
        </FormSubmit>
      </FormActions>
    </SettingsSection>
  </Form>

  <SettingsSection
    eyebrow="Konto"
    title="Kontoinformasjon"
    description="Tilgang og opplysninger som administreres av klubben."
  >
    <SettingsPanel>
      <SettingsRow title="E-post"><SettingsValue>{user.epost}</SettingsValue></SettingsRow>
      <SettingsRow title="Rolle">
        <SettingsValue>{formaterRoller(user.roller, "Ingen klubbrolle")}</SettingsValue>
      </SettingsRow>
      {#if user.medlemskapBekreftelseLabel}
        <SettingsRow title="Medlemskap">
          <SettingsValue>{user.medlemskapBekreftelseLabel}</SettingsValue>
        </SettingsRow>
      {/if}
      {#if user.medlemskapBekreftelseLabel && user.fulltNavn}
        <SettingsRow title="Navn i medlemskapet">
          <SettingsValue>{user.fulltNavn}</SettingsValue>
        </SettingsRow>
      {/if}
      {#if user.medlemskapBekreftelseLabel && user.medlemskapType}
        <SettingsRow title="Medlemskapstype">
          <SettingsValue>{formaterMedlemskapType(user.medlemskapType)}</SettingsValue>
        </SettingsRow>
      {/if}
      {#if user.medlemskapBekreftelseLabel && user.medlemskapBekreftetDato}
        <SettingsRow title="Bekreftet">
          <SettingsValue>
            {new Date(user.medlemskapBekreftetDato).toLocaleDateString("nb-NO")}
          </SettingsValue>
        </SettingsRow>
      {/if}
    </SettingsPanel>
  </SettingsSection>

  <SettingsSection
    eyebrow="Fareområde"
    title="Slett konto"
    description="Sletter kontoen og alle tilknyttede data permanent. Handlingen kan ikke angres."
    tone="danger"
  >
    <FormActions align="start">
      <DeleteAccountDialog disabled={update.isPending} />
    </FormActions>
  </SettingsSection>
</SettingsStack>
