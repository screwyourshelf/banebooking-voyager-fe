<script lang="ts">
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { formatDatoKort } from "$lib/domain";
  import { getApiClient } from "$lib/platform/api";
  import { getTenantContext } from "$lib/platform/tenant";
  import {
    Button,
    DatePicker,
    ErrorState,
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    PageLoading,
    SettingsPanel,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsValue,
  } from "$lib/ui";
  import {
    MAX_MEMBERSHIP_PERIOD_LABEL_LENGTH,
    toMembershipActivationRequest,
    validateMembershipActivation,
    type MembershipActivationDraft,
  } from "./model";
  import {
    activateMembershipMutationOptions,
    deactivateMembershipMutationOptions,
    membershipStatusQueryOptions,
  } from "./queries";

  let { canManage }: { canManage: boolean } = $props();

  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const statusQuery = createQuery(() => membershipStatusQueryOptions(api, tenant.slug));
  const activate = createMutation(() =>
    activateMembershipMutationOptions(api, queryClient, tenant.slug)
  );
  const deactivate = createMutation(() =>
    deactivateMembershipMutationOptions(api, queryClient, tenant.slug)
  );
  let draft = $state<MembershipActivationDraft>({ label: "", expiresOn: null });
  let submitted = $state(false);
  const errors = $derived(validateMembershipActivation(draft));

  function submitActivation(event: SubmitEvent) {
    event.preventDefault();
    if (activate.isPending || !canManage) return;
    submitted = true;
    const request = toMembershipActivationRequest(draft);
    if (!request) {
      const invalidControl = errors.label ? "membership-period-label" : "membership-period-expiry";
      (event.currentTarget as HTMLFormElement)
        .querySelector<HTMLElement>(`#${invalidControl}`)
        ?.focus();
      return;
    }

    void activate
      .mutateAsync(request)
      .then(() => {
        draft = { label: "", expiresOn: null };
        submitted = false;
      })
      .catch(() => undefined);
  }
</script>

{#if statusQuery.isPending}
  <PageLoading label="Laster medlemsinnstillinger" />
{:else if statusQuery.isError || !statusQuery.data}
  <ErrorState
    title="Kunne ikke laste status for medlemsbekreftelse"
    description={statusQuery.error instanceof Error ? statusQuery.error.message : "Prøv igjen."}
    isRetrying={statusQuery.isFetching}
    onRetry={() => void statusQuery.refetch()}
  />
{:else}
  {@const activeConfirmation = statusQuery.data.aktivBekreftelse}
  <SettingsStack>
    <SettingsSection
      eyebrow="Medlemskap"
      title="Bekreftelsesperiode"
      description="Følg status og hvor mange som har fullført."
    >
      <SettingsPanel>
        <SettingsRow
          title="Status"
          description={activeConfirmation
            ? "Medlemmer blir bedt om å bekrefte."
            : "Medlemmer trenger ikke å bekrefte nå."}
        >
          <SettingsValue>{activeConfirmation?.label ?? "Ingen aktiv periode"}</SettingsValue>
        </SettingsRow>

        {#if activeConfirmation}
          <SettingsRow title="Startet">
            <SettingsValue>{formatDatoKort(activeConfirmation.opprettetTidspunkt)}</SettingsValue>
          </SettingsRow>
          <SettingsRow title="Gyldig til">
            <SettingsValue>{formatDatoKort(activeConfirmation.gyldigTil)}</SettingsValue>
          </SettingsRow>
          <SettingsRow title="Bekreftet">
            <SettingsValue>
              {statusQuery.data.antallBekreftet} av {statusQuery.data.antallTotalt} medlemmer
            </SettingsValue>
          </SettingsRow>
        {/if}
      </SettingsPanel>
    </SettingsSection>

    {#if !canManage}
      <Feedback
        tone="warning"
        title="Du kan se medlemsstatus, men ikke endre perioden"
        description="Klubben må gi brukeren din tilgang til medlemskapsadministrasjon."
      />
    {:else if !activeConfirmation}
      <Form onsubmit={submitActivation} pending={activate.isPending}>
        <SettingsSection
          eyebrow="Ny periode"
          title="Start medlemsbekreftelse"
          description="Alle medlemmer må bekrefte innen sluttdatoen."
        >
          <FormFields>
            <FormField
              label="Periodenavn"
              description="For eksempel &quot;Sesong 2026&quot;."
              controlId="membership-period-label"
              error={submitted ? errors.label : null}
              required
            >
              <Input
                name="label"
                placeholder="Sesong 2026"
                maxlength={MAX_MEMBERSHIP_PERIOD_LABEL_LENGTH}
                bind:value={draft.label}
                disabled={activate.isPending}
                oninput={() => activate.reset()}
              />
            </FormField>

            <FormField
              label="Gyldig til"
              description="Dato perioden utløper."
              controlId="membership-period-expiry"
              error={submitted ? errors.expiresOn : null}
              required
            >
              <DatePicker
                name="gyldigTil"
                aria-label="Velg gyldighetsdato"
                bind:value={draft.expiresOn}
                pending={activate.isPending}
                onValueChange={() => activate.reset()}
              />
            </FormField>
          </FormFields>

          <FormActions>
            {#if activate.isError}
              <Feedback
                tone="danger"
                title="Medlemsbekreftelsen kunne ikke aktiveres"
                description={activate.error instanceof Error
                  ? activate.error.message
                  : "Prøv igjen."}
              />
            {/if}
            <FormSubmit pending={activate.isPending} pendingLabel="Aktiverer …">
              Aktiver bekreftelse
            </FormSubmit>
          </FormActions>
        </SettingsSection>
      </Form>
    {:else}
      <SettingsSection
        eyebrow="Kontroll"
        title="Avslutt medlemsbekreftelsen"
        description="Tidligere bekreftelser beholdes når perioden avsluttes."
        tone="danger"
      >
        <FormActions align="start">
          {#if deactivate.isError}
            <Feedback
              tone="danger"
              title="Medlemsbekreftelsen kunne ikke deaktiveres"
              description={deactivate.error instanceof Error
                ? deactivate.error.message
                : "Prøv igjen."}
            />
          {/if}
          <Button
            variant="destructive"
            disabled={deactivate.isPending}
            aria-busy={deactivate.isPending || undefined}
            onclick={() => void deactivate.mutateAsync().catch(() => undefined)}
          >
            {deactivate.isPending ? "Deaktiverer …" : "Deaktiver bekreftelse"}
          </Button>
        </FormActions>
      </SettingsSection>
    {/if}
  </SettingsStack>
{/if}
