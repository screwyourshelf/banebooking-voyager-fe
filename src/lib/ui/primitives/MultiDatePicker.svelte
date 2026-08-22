<script lang="ts">
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";
  import MultipleCalendar from "./MultipleCalendar.svelte";

  type Props = {
    "aria-describedby"?: string | null;
    "aria-label"?: string;
    calendarLabel?: string;
    disabled?: boolean;
    maxSelections?: number;
    maxValue?: string;
    minValue?: string;
    name?: string;
    onValueChange?: (value: string[]) => void;
    pending?: boolean;
    required?: boolean | null;
    value?: string[];
  };

  let {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    calendarLabel = "Velg datoer",
    disabled = false,
    maxSelections,
    maxValue,
    minValue,
    name,
    onValueChange,
    pending = false,
    required,
    value = $bindable([]),
  }: Props = $props();

  const formControl = getOptionalFormControlContext();
  const generatedId = $props.id();
  const resolvedRequired = $derived(Boolean(required || formControl?.required));
  const requiredDescriptionId = $derived(resolvedRequired ? `${generatedId}-required` : undefined);
  const resolvedDescribedBy = $derived(
    mergeAriaIds(
      ariaDescribedBy,
      formControl?.descriptionId,
      formControl?.errorId,
      requiredDescriptionId
    )
  );
  const isDisabled = $derived(disabled || pending);

  function updateValue(nextValue: string[]) {
    value = nextValue;
    onValueChange?.(nextValue);
  }
</script>

<div
  data-ui-primitive="multi-date-picker"
  role="group"
  aria-label={ariaLabel}
  aria-labelledby={formControl?.labelId}
  aria-describedby={resolvedDescribedBy}
  aria-busy={pending || undefined}
  aria-disabled={isDisabled || undefined}
  data-invalid={formControl?.invalid || undefined}
  data-required={resolvedRequired || undefined}
>
  <MultipleCalendar
    {value}
    {minValue}
    {maxValue}
    {maxSelections}
    {calendarLabel}
    disabled={isDisabled}
    onValueChange={updateValue}
  />

  {#if name}
    {#each value as selectedDate (selectedDate)}
      <input type="hidden" {name} value={selectedDate} disabled={isDisabled} />
    {/each}
    {#if value.length === 0}
      <input type="hidden" {name} value="" required={resolvedRequired} disabled={isDisabled} />
    {/if}
  {/if}
  {#if requiredDescriptionId}
    <span id={requiredDescriptionId} data-part="required-description">Obligatorisk felt.</span>
  {/if}
</div>
