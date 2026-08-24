<script lang="ts">
  import Collection from "./Collection.svelte";
  import CollectionControls from "./CollectionControls.svelte";
  import type {
    CollectionChoiceContext,
    CollectionControlField,
    CollectionControlGroup,
  } from "./collection-controls";
  import CollectionEmpty from "./CollectionEmpty.svelte";
  import DatePicker from "../primitives/DatePicker.svelte";

  let {
    pending = false,
    onDateChange,
    onReset,
    onRoleChange,
    onSearchChange,
    onSortChange,
    onTogglePast,
  }: {
    pending?: boolean;
    onDateChange: (value: string) => void;
    onReset: () => void;
    onRoleChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onSortChange: (value: string) => void;
    onTogglePast: (checked: boolean) => void;
  } = $props();

  let showPast = $state(false);
  let query = $state("Ada");
  let selectedRoles = $state<string[]>(["admin"]);
  let selectedDay = $state("today");
  let selectedDate = $state("2026-08-22");
  let sortValue = $state("name");
  let period = $state("year");
  let compare = $state(false);

  function selectRole(value: string) {
    selectedRoles = selectedRoles.includes(value)
      ? selectedRoles.filter((role) => role !== value)
      : [...selectedRoles, value];
    onRoleChange(value);
  }

  function resetFilters() {
    query = "";
    selectedRoles = [];
    onReset();
  }

  const filterGroups = $derived<CollectionControlGroup[]>([
    {
      label: "Rolle",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "member", label: "Medlem" },
      ],
      selectedValues: selectedRoles,
      onSelect: selectRole,
    },
  ]);

  const fields = $derived<CollectionControlField[]>([
    {
      id: "period",
      label: "Periode",
      type: "select",
      value: period,
      options: [
        { value: "year", label: "Året så langt" },
        { value: "previous", label: "Forrige kalenderår" },
      ],
      onValueChange: (value) => (period = value),
    },
    {
      id: "compare",
      type: "switch",
      title: "Sammenlign med året før",
      description: "Bruker samme datoer ett år tidligere",
      checked: compare,
      width: "wide",
      onCheckedChange: (checked) => (compare = checked),
    },
  ]);
</script>

{#snippet dateChoice({ disabled, selected }: CollectionChoiceContext)}
  <DatePicker
    presentation="booking"
    value={selectedDate}
    minValue="2026-08-22"
    {disabled}
    {selected}
    aria-label="Velg annen dato"
    onValueChange={(value) => {
      selectedDate = value;
      selectedDay = "date";
      onDateChange(value);
    }}
  />
{/snippet}

{#snippet filters()}
  <CollectionControls
    mode="selection"
    label="Velg dag"
    groups={[
      {
        label: "Dag",
        options: [
          { value: "today", label: "I dag" },
          { value: "tomorrow", label: "I morgen" },
          { value: "date", label: "Velg dato", control: dateChoice },
        ],
        selectedValues: [selectedDay],
        onSelect: (value) => (selectedDay = value),
      },
    ]}
    {pending}
  />
  <CollectionControls
    label="Filtrer brukere"
    groups={filterGroups}
    {fields}
    search={{
      label: "Søk etter bruker",
      placeholder: "Søk på navn eller e-post",
      value: query,
      onValueChange: (value) => {
        query = value;
        onSearchChange(value);
      },
    }}
    sort={{
      label: "Sorter etter",
      value: sortValue,
      options: [
        { value: "name", label: "Navn" },
        { value: "newest", label: "Nyeste" },
      ],
      onValueChange: (value) => {
        sortValue = value;
        onSortChange(value);
      },
    }}
    onReset={resetFilters}
    {pending}
  />
{/snippet}

<Collection
  title="0 brukere"
  scope="Medlemskap, roller og tilgang"
  filtersLabel="Utvalg og filtre"
  {filters}
  toggle={{
    title: "Vis tidligere",
    checked: showPast,
    pending,
    onCheckedChange: (checked) => {
      showPast = checked;
      onTogglePast(checked);
    },
  }}
>
  <CollectionEmpty title="Ingen brukere funnet" description="Prøv et annet søk eller filter." />
</Collection>
