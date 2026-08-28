<script lang="ts">
  import type { BaneRespons, BookingInnstillingRespons, GrenRespons } from "$lib/contracts";
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
    SettingsSection,
    SettingsStack,
    SettingsSwitchRow,
  } from "$lib/ui";
  import BookingTimeFields from "./BookingTimeFields.svelte";
  import { EMPTY_BOOKING_OVERRIDE, type CourtDraft } from "./model";

  let {
    court,
    draft,
    error,
    errors,
    mode,
    onChange,
    onSubmit,
    pending = false,
    saved = false,
    activities,
    valid,
  }: {
    activities: GrenRespons[];
    court?: BaneRespons;
    draft: CourtDraft;
    error?: string | null;
    errors: { activityId: string | null; description: string | null; name: string | null };
    mode: "create" | "edit";
    onChange: (draft: CourtDraft) => void;
    onSubmit: () => void;
    pending?: boolean;
    saved?: boolean;
    valid: boolean;
  } = $props();

  const activityOptions = $derived(
    activities.map((activity) => ({ label: activity.navn, value: activity.id }))
  );
  const activityDefaults = $derived(
    activities.find((activity) => activity.id === draft.activityId)?.bookingInnstillinger
  );
  const changed = (patch: Partial<CourtDraft>) => onChange({ ...draft, ...patch });

  function changeBookingTime(
    field: keyof NonNullable<CourtDraft["overrides"]>,
    value: number | null
  ) {
    if (!draft.overrides) return;
    changed({ overrides: { ...draft.overrides, [field]: value } });
  }
</script>

<Form
  variant="editor"
  {pending}
  onsubmit={(event) => {
    event.preventDefault();
    onSubmit();
  }}
>
  <SettingsStack embedded>
    <SettingsSection
      embedded
      eyebrow="Bane"
      title="Baneinformasjon"
      description="Det medlemmene kjenner igjen i bookingoversikten."
    >
      <FormFields>
        <FormField label="Navn" error={errors.name} required>
          <Input
            value={draft.name}
            oninput={(event) => changed({ name: event.currentTarget.value })}
            placeholder="For eksempel Bane A"
            maxlength={100}
            autocomplete="off"
            disabled={pending}
          />
        </FormField>
        <FormField label="Gren" error={errors.activityId} required>
          <Select
            value={draft.activityId}
            options={activityOptions}
            placeholder="Velg gren …"
            onValueChange={(activityId) => changed({ activityId })}
            disabled={pending}
          />
        </FormField>
        <FormField label="Beskrivelse" error={errors.description}>
          <Input
            value={draft.description}
            oninput={(event) => changed({ description: event.currentTarget.value })}
            placeholder="For eksempel nær klubbhuset"
            maxlength={500}
            autocomplete="off"
            disabled={pending}
          />
        </FormField>
      </FormFields>
    </SettingsSection>

    {#if mode === "edit"}
      <SettingsSection
        embedded
        eyebrow="Booking"
        title="Tilgjengelighet"
        description="Styr om banen kan bookes og om den avviker fra grenens standard."
      >
        <SettingsPanel>
          <SettingsSwitchRow
            title="Aktiv"
            description="Vis banen i bookingflyten."
            checked={draft.active}
            onCheckedChange={(active) => changed({ active })}
            disabled={pending}
          />
          <SettingsSwitchRow
            title="Avvik fra grenstandard"
            description={activityDefaults
              ? `Bruk andre tider eller bookinghorisont enn standarden for ${activities.find((item) => item.id === draft.activityId)?.navn ?? "grenen"}.`
              : "Velg en aktiv gren for å angi avvik."}
            checked={draft.overrides !== null}
            onCheckedChange={(enabled) =>
              changed({ overrides: enabled ? { ...EMPTY_BOOKING_OVERRIDE } : null })}
            disabled={pending || !activityDefaults}
          />
        </SettingsPanel>
      </SettingsSection>

      {#if draft.overrides && activityDefaults}
        <SettingsSection
          embedded
          eyebrow="Avvik"
          title="Tider og bookinghorisont"
          description="Kvotene gjelder hele grenen og kan ikke endres per bane."
        >
          <SettingsPanel>
            <BookingTimeFields
              values={draft.overrides}
              defaults={activityDefaults as BookingInnstillingRespons}
              onChange={changeBookingTime}
              overridable
              disabled={pending}
            />
          </SettingsPanel>
        </SettingsSection>
      {/if}
    {/if}

    <FormActions>
      {#if error}<Feedback
          tone="danger"
          title="Endringene kunne ikke lagres"
          description={error}
        />{/if}
      {#if saved}<Feedback tone="success" title="Baneinnstillingene er lagret" />{/if}
      <FormSubmit
        {pending}
        disabled={!valid}
        pendingLabel={mode === "create" ? "Oppretter …" : "Lagrer …"}
      >
        {#if mode === "create"}Opprett bane{:else}Lagre endringer{/if}
      </FormSubmit>
    </FormActions>
  </SettingsStack>
</Form>
