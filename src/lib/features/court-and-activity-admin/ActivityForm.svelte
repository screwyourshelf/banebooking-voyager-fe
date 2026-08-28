<script lang="ts">
  import {
    Feedback,
    Form,
    FormActions,
    FormField,
    FormFields,
    FormSubmit,
    Input,
    SettingsPanel,
    SettingsSection,
    SettingsStack,
    SettingsSwitchRow,
    Textarea,
  } from "$lib/ui";
  import BookingQuotaFields from "./BookingQuotaFields.svelte";
  import BookingTimeFields from "./BookingTimeFields.svelte";
  import type { ActivityDraft, BookingOverrideDraft } from "./model";

  let {
    draft,
    error,
    errors,
    mode,
    onChange,
    onSubmit,
    pending = false,
    saved = false,
    valid,
  }: {
    draft: ActivityDraft;
    error?: string | null;
    errors: { hours: string | null; name: string | null; rules: string | null };
    mode: "create" | "edit";
    onChange: (draft: ActivityDraft) => void;
    onSubmit: () => void;
    pending?: boolean;
    saved?: boolean;
    valid: boolean;
  } = $props();

  const changed = (patch: Partial<ActivityDraft>) => onChange({ ...draft, ...patch });
  const timeValues = $derived<BookingOverrideDraft>({
    openingHour: draft.openingHour,
    closingHour: draft.closingHour,
    daysAhead: draft.daysAhead,
    slotMinutes: draft.slotMinutes,
  });

  function changeBookingTime(field: keyof BookingOverrideDraft, value: number | null) {
    if (value === null) return;
    const draftKey: Record<keyof BookingOverrideDraft, keyof ActivityDraft> = {
      openingHour: "openingHour",
      closingHour: "closingHour",
      daysAhead: "daysAhead",
      slotMinutes: "slotMinutes",
    };
    changed({ [draftKey[field]]: value });
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
      eyebrow="Gren"
      title="Greninformasjon"
      description="Navn og regler medlemmene møter i bookingflyten."
    >
      <FormFields>
        <FormField label="Navn" error={errors.name} required>
          <Input
            value={draft.name}
            oninput={(event) => changed({ name: event.currentTarget.value })}
            placeholder="For eksempel Tennis"
            maxlength={100}
            autocomplete="off"
            disabled={pending}
          />
        </FormField>
        <FormField
          label="Banereglement"
          description="Valgfritt. Vises før booking."
          error={errors.rules}
        >
          <Textarea
            value={draft.rules}
            oninput={(event) => changed({ rules: event.currentTarget.value })}
            placeholder="Skriv reglene medlemmene skal se"
            maxlength={5000}
            rows={4}
            disabled={pending}
          />
        </FormField>
        <FormField label="Sortering" description="Lavest vises først.">
          <Input
            type="number"
            value={draft.sortOrder}
            oninput={(event) => changed({ sortOrder: Number(event.currentTarget.value) })}
            disabled={pending}
          />
        </FormField>
      </FormFields>
    </SettingsSection>

    {#if mode === "edit"}
      <SettingsSection
        embedded
        eyebrow="Tilgjengelighet"
        title="Synlighet"
        description="Styr om grenen og banene vises i bookingflyten."
      >
        <SettingsPanel>
          <SettingsSwitchRow
            title="Aktiv"
            description="Vis grenen i bookingflyten."
            checked={draft.active}
            onCheckedChange={(active) => changed({ active })}
            disabled={pending}
          />
        </SettingsPanel>
      </SettingsSection>
    {/if}

    <SettingsSection
      embedded
      eyebrow="Booking"
      title="Bookinginnstillinger"
      description="Kvoter for hele grenen og standardtider for alle banene."
    >
      {#if errors.hours}<Feedback
          tone="danger"
          title="Kontroller åpningstidene"
          description={errors.hours}
        />{/if}
      <SettingsPanel>
        <BookingQuotaFields
          maxPerDay={draft.maxPerDay}
          maxUpcoming={draft.maxUpcoming}
          onChange={(field, value) => changed({ [field]: value })}
          disabled={pending}
        />
        <BookingTimeFields values={timeValues} onChange={changeBookingTime} disabled={pending} />
      </SettingsPanel>
    </SettingsSection>

    <FormActions>
      {#if error}<Feedback
          tone="danger"
          title="Endringene kunne ikke lagres"
          description={error}
        />{/if}
      {#if saved}<Feedback tone="success" title="Greninnstillingene er lagret" />{/if}
      <FormSubmit
        {pending}
        disabled={!valid}
        pendingLabel={mode === "create" ? "Oppretter …" : "Lagrer …"}
      >
        {#if mode === "create"}Opprett gren{:else}Lagre endringer{/if}
      </FormSubmit>
    </FormActions>
  </SettingsStack>
</Form>
