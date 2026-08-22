<script lang="ts" module>
  export type DatePickerPresentation = "booking" | "field" | "filter";
</script>

<script lang="ts">
  import { Popover } from "bits-ui";
  import { tick } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";
  import { formatDatePickerValue, parseIsoDate } from "./calendar-date";
  import SingleCalendar from "./SingleCalendar.svelte";

  type Props = {
    "aria-describedby"?: string | null;
    "aria-invalid"?: HTMLButtonAttributes["aria-invalid"];
    "aria-label"?: string;
    calendarLabel?: string;
    disabled?: boolean;
    id?: string | null;
    maxValue?: string;
    minValue?: string;
    name?: string;
    onValueChange?: (value: string) => void;
    pending?: boolean;
    placeholder?: string;
    presentation?: DatePickerPresentation;
    required?: boolean | null;
    selected?: boolean;
    showDayNavigation?: boolean;
    value?: string | null;
  };

  let {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    calendarLabel = "Velg dato",
    disabled = false,
    id,
    maxValue,
    minValue,
    name,
    onValueChange,
    pending = false,
    placeholder = "Velg dato",
    presentation = "field",
    required,
    selected = false,
    showDayNavigation = false,
    value = $bindable(null),
  }: Props = $props();

  const formControl = getOptionalFormControlContext();
  const generatedId = $props.id();
  const resolvedId = $derived(formControl?.controlId ?? id);
  const resolvedRequired = $derived(Boolean(required || formControl?.required));
  const requiredDescriptionId = $derived(
    resolvedRequired ? `${resolvedId ?? generatedId}-required` : undefined
  );
  const resolvedInvalid = $derived(ariaInvalid ?? (formControl?.invalid ? "true" : undefined));
  const resolvedDescribedBy = $derived(
    mergeAriaIds(
      ariaDescribedBy,
      formControl?.descriptionId,
      formControl?.errorId,
      requiredDescriptionId
    )
  );
  const isDisabled = $derived(disabled || pending);
  const displayValue = $derived(formatDatePickerValue(value, presentation) ?? placeholder);
  const parsedValue = $derived(parseIsoDate(value));
  const minimumDate = $derived(parseIsoDate(minValue));
  const maximumDate = $derived(parseIsoDate(maxValue));
  const previousValue = $derived(parsedValue?.subtract({ days: 1 }));
  const nextValue = $derived(parsedValue?.add({ days: 1 }));
  const previousDisabled = $derived(
    isDisabled || !previousValue || (minimumDate ? previousValue.compare(minimumDate) < 0 : false)
  );
  const nextDisabled = $derived(
    isDisabled || !nextValue || (maximumDate ? nextValue.compare(maximumDate) > 0 : false)
  );
  let open = $state(false);
  let popoverContent: HTMLElement | null = $state(null);
  let triggerElement: HTMLButtonElement | null = $state(null);

  function updateValue(nextValue: string) {
    value = nextValue;
    onValueChange?.(nextValue);
  }

  function selectValue(nextValue: string) {
    updateValue(nextValue);
    open = false;
  }

  function selectPreviousDay() {
    if (!previousDisabled && previousValue) updateValue(previousValue.toString());
  }

  function selectNextDay() {
    if (!nextDisabled && nextValue) updateValue(nextValue.toString());
  }

  function focusCalendar(event: Event) {
    event.preventDefault();
    void tick().then(() => {
      popoverContent?.querySelector<HTMLElement>('[data-part="day"][data-focused]')?.focus();
    });
  }

  function restoreTriggerFocus(nextOpen: boolean) {
    if (!nextOpen) triggerElement?.focus();
  }
</script>

<div
  data-ui-primitive="date-picker"
  data-presentation={presentation}
  data-navigation={showDayNavigation || undefined}
>
  {#if showDayNavigation}
    <button
      type="button"
      data-part="day-button"
      aria-label="Forrige dag"
      disabled={previousDisabled}
      onclick={selectPreviousDay}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg>
    </button>
  {/if}

  <Popover.Root bind:open onOpenChangeComplete={restoreTriggerFocus}>
    <Popover.Trigger
      bind:ref={triggerElement}
      type="button"
      id={resolvedId ?? undefined}
      data-part="trigger"
      data-placeholder={!value || undefined}
      data-selected={selected || undefined}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-labelledby={formControl?.labelId}
      aria-busy={pending || undefined}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid}
      data-required={resolvedRequired || undefined}
    >
      <svg data-part="calendar-icon" aria-hidden="true" viewBox="0 0 20 20">
        <path
          d="M5 3v2M15 3v2M3.5 7.5h13M5 4h10a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 15 17H5a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 5 4Z"
        />
      </svg>
      <span>{displayValue}</span>
    </Popover.Trigger>

    <Popover.Portal>
      <Popover.Content
        bind:ref={popoverContent}
        data-ui-primitive="date-popover"
        align="start"
        sideOffset={6}
        collisionPadding={8}
        onOpenAutoFocus={focusCalendar}
      >
        <SingleCalendar
          {value}
          {minValue}
          {maxValue}
          {calendarLabel}
          disabled={isDisabled}
          initialFocus
          onValueChange={selectValue}
        />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>

  {#if showDayNavigation}
    <button
      type="button"
      data-part="day-button"
      aria-label="Neste dag"
      disabled={nextDisabled}
      onclick={selectNextDay}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg>
    </button>
  {/if}

  {#if name}
    <input
      type="hidden"
      {name}
      value={value ?? ""}
      required={resolvedRequired}
      disabled={isDisabled}
    />
  {/if}
  {#if requiredDescriptionId}
    <span id={requiredDescriptionId} data-part="required-description">Obligatorisk felt.</span>
  {/if}
</div>
