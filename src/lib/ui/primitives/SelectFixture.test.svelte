<script lang="ts">
  import { Form, FormField, FormFields, Select } from "$lib/ui";
  import type { SelectOption } from "./Select.svelte";

  let {
    disabled = false,
    empty = false,
    invalid = false,
    onValueChange,
    pending = false,
  }: {
    disabled?: boolean;
    empty?: boolean;
    invalid?: boolean;
    onValueChange: (value: CourtValue) => void;
    pending?: boolean;
  } = $props();

  type CourtValue = "court-a" | "court-b" | "court-c";

  const courtOptions: readonly SelectOption<CourtValue>[] = [
    { value: "court-a", label: "Bane A" },
    { value: "court-b", label: "Padelbane" },
    { value: "court-c", label: "Bane C", disabled: true },
  ];

  let court = $state<CourtValue>();
</script>

<main>
  <Form>
    <FormFields>
      <FormField
        label="Bane"
        description="Velg banen bookingen skal flyttes til."
        error={invalid ? "Du må velge en bane." : undefined}
        required
      >
        <Select
          bind:value={court}
          options={empty ? [] : courtOptions}
          placeholder="Velg bane…"
          name="court"
          {disabled}
          {pending}
          {onValueChange}
        />
      </FormField>
    </FormFields>
  </Form>
</main>
