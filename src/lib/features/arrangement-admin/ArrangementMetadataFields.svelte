<script lang="ts">
  import type { GrenRespons } from "$lib/contracts";
  import { ARRANGEMENT_KATEGORI_VALG } from "$lib/domain";
  import {
    FormField,
    FormFields,
    Input,
    RichTextEditor,
    Select,
    SettingsSection,
    SettingsSwitchRow,
    Textarea,
  } from "$lib/ui";
  import type { ArrangementMetadataDraft, ArrangementMetadataErrors } from "./model";

  let {
    activities,
    disabled = false,
    draft = $bindable(),
    errors,
    onChange,
  }: {
    activities: readonly GrenRespons[];
    disabled?: boolean;
    draft: ArrangementMetadataDraft;
    errors: ArrangementMetadataErrors;
    onChange?: () => void;
  } = $props();

  function changed() {
    onChange?.();
  }
</script>

<SettingsSection
  embedded
  eyebrow="Arrangement"
  title="Grunnlag"
  description="Velg gren og kategori, og legg inn en intern beskrivelse."
>
  <FormFields>
    <FormField
      label="Gren"
      description="Styrer hvilke baner du kan velge."
      error={errors.activityId}
      required
    >
      <Select
        name="grenId"
        options={activities.map((activity) => ({ value: activity.id, label: activity.navn }))}
        bind:value={draft.activityId}
        placeholder="Velg gren…"
        {disabled}
        onValueChange={changed}
      />
    </FormField>

    <FormField label="Kategori" required>
      <Select
        name="kategori"
        options={ARRANGEMENT_KATEGORI_VALG}
        bind:value={draft.category}
        {disabled}
        onValueChange={changed}
      />
    </FormField>

    <FormField
      label="Intern beskrivelse"
      description="Vises i Banebooking og kan endres uten å endre banetidene."
    >
      <Textarea
        name="beskrivelse"
        bind:value={draft.description}
        placeholder="Kort beskrivelse av arrangementet"
        {disabled}
        oninput={changed}
      />
    </FormField>
  </FormFields>
</SettingsSection>

<SettingsSection
  embedded
  eyebrow="Nettside"
  title="Publisering"
  description="Bestem om arrangementet også skal presenteres på klubbens nettside."
>
  <FormFields>
    <SettingsSwitchRow
      title="Vis på nettsiden"
      description="Publiser med en egen tittel og presentasjonstekst."
      bind:checked={draft.publishedOnWebsite}
      {disabled}
      onCheckedChange={changed}
    />

    {#if draft.publishedOnWebsite}
      <FormField label="Tittel på nettsiden" error={errors.websiteTitle}>
        <Input
          name="nettsideTittel"
          bind:value={draft.websiteTitle}
          placeholder="F.eks. Vårturnering 2026"
          maxlength={100}
          {disabled}
          oninput={changed}
        />
      </FormField>
      <FormField label="Presentasjon på nettsiden">
        <RichTextEditor
          name="nettsideBeskrivelse"
          bind:value={draft.websiteDescription}
          {disabled}
          onValueChange={changed}
        />
      </FormField>
    {/if}
  </FormFields>
</SettingsSection>
