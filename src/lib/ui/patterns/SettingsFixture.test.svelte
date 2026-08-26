<script lang="ts">
  import {
    SettingsChoiceGroup,
    SettingsPanel,
    SettingsRadioGroup,
    SettingsRange,
    SettingsRow,
    SettingsSection,
    SettingsStack,
    SettingsSwitchRow,
    SettingsText,
    SettingsValue,
  } from "../index";

  let {
    disabled = false,
    onChoice,
    onMethod,
    onPublished,
    onRange,
    pending = false,
  }: {
    disabled?: boolean;
    onChoice: (value: string) => void;
    onMethod: (value: string) => void;
    onPublished: (checked: boolean) => void;
    onRange: (value: number) => void;
    pending?: boolean;
  } = $props();

  let method = $state("repeat");
  let published = $state(true);
  let selectedCourts = $state<string[]>(["court-1"]);
  let maxBookings = $state(2);

  function changeMethod(value: string) {
    method = value;
    onMethod(value);
  }

  function toggleCourt(value: string) {
    selectedCourts = selectedCourts.includes(value)
      ? selectedCourts.filter((court) => court !== value)
      : [...selectedCourts, value];
    onChoice(value);
  }
</script>

{#snippet rangeLabels()}
  <span>1</span><span>5</span>
{/snippet}

{#snippet rangeValue()}<SettingsValue>{maxBookings}</SettingsValue>{/snippet}

<SettingsStack>
  <SettingsSection
    eyebrow="Nettside"
    title="Publisering og oppsett"
    description="Styr synlighet og hvilke tider arrangementet bruker."
  >
    <SettingsPanel>
      <SettingsRow title="Status" description="Arrangementet er tilgjengelig for medlemmer.">
        <SettingsValue>Aktiv</SettingsValue>
      </SettingsRow>

      <SettingsRow title="Sist lagret">
        <SettingsText>I dag kl. 14.30.</SettingsText>
      </SettingsRow>

      <SettingsSwitchRow
        title="Vis på nettsiden"
        description="Publiser arrangementet med egen presentasjon."
        bind:checked={published}
        onCheckedChange={onPublished}
        {disabled}
        {pending}
      />

      <SettingsRow title="Metode" description="Velg hvordan tidene skal opprettes.">
        <SettingsRadioGroup
          label="Velg oppsettstype"
          value={method}
          onValueChange={changeMethod}
          options={[
            { value: "repeat", label: "Gjentakende", description: "Samme tider hver uke." },
            { value: "manual", label: "Manuelt", description: "Velg konkrete datoer." },
          ]}
          {disabled}
          {pending}
        />
      </SettingsRow>

      <SettingsRow title="Baner" description="Velg én eller flere baner.">
        <SettingsChoiceGroup
          label="Baner"
          options={[
            { value: "court-1", label: "Bane 1" },
            { value: "court-2", label: "Bane 2" },
            { value: "court-3", label: "Bane 3", disabled: true },
          ]}
          selectedValues={selectedCourts}
          onToggle={toggleCourt}
          {disabled}
          {pending}
        />
      </SettingsRow>

      <SettingsRow title="Maks per dag" right={rangeValue}>
        <SettingsRange
          aria-label="Maks bookinger per dag"
          value={maxBookings}
          min="1"
          max="5"
          labels={rangeLabels}
          oninput={(event) => {
            maxBookings = Number(event.currentTarget.value);
            onRange(maxBookings);
          }}
          {disabled}
        />
      </SettingsRow>
    </SettingsPanel>
  </SettingsSection>
</SettingsStack>
