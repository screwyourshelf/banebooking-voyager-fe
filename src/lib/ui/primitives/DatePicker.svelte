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
  const displaysBookingPlaceholder = $derived(presentation === "booking" && !selected);
  const displayValue = $derived(
    displaysBookingPlaceholder
      ? placeholder
      : (formatDatePickerValue(value, presentation) ?? placeholder)
  );
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
  class={[
    "grid min-w-0 gap-sm",
    presentation === "booking" ? "w-fit" : "w-full",
    showDayNavigation
      ? "grid-cols-date-navigation compact-control:grid-cols-date-navigation-compact"
      : "grid-cols-1",
  ]}
  data-ui-primitive="date-picker"
  data-presentation={presentation}
  data-navigation={showDayNavigation || undefined}
>
  {#if showDayNavigation}
    <button
      class="inline-flex min-w-0 min-h-date-trigger items-center justify-center border border-field-control-border rounded-control bg-field-control-surface p-0 font-body text-field-control-text cursor-pointer outline-none transition duration-120 enabled:hover:bg-surface-subtle focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-field-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      data-part="day-button"
      aria-label="Forrige dag"
      disabled={previousDisabled}
      onclick={selectPreviousDay}
    >
      <svg
        class="w-control-icon h-control-icon flex-none"
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"><path d="m12.5 4.5-5 5.5 5 5.5" /></svg
      >
    </button>
  {/if}

  <Popover.Root bind:open onOpenChangeComplete={restoreTriggerFocus}>
    <Popover.Trigger
      class={[
        "inline-flex min-w-0 items-center justify-start gap-sm overflow-hidden border font-body text-body-sm text-left cursor-pointer outline-none transition duration-120 focus-visible:ring-3 focus-visible:ring-field-focus-ring aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-field-invalid-ring aria-[invalid=true]:focus-visible:ring-field-invalid-ring disabled:cursor-not-allowed disabled:opacity-50",
        presentation === "booking"
          ? selected
            ? "min-h-control border-choice-selected-border rounded-choice bg-choice-selected-surface px-choice-inline py-choice-block font-choice text-choice-selected-text"
            : "min-h-control border-field-control-border rounded-choice bg-field-control-surface px-choice-inline py-choice-block font-choice text-choice-text enabled:hover:bg-surface-subtle focus-visible:border-focus aria-[invalid=true]:border-status-danger-indicator aria-[invalid=true]:focus-visible:border-status-danger-indicator"
          : "min-h-date-trigger border-field-control-border rounded-control bg-field-control-surface px-date-control-inline py-control-block font-action text-field-control-text enabled:hover:bg-surface-subtle focus-visible:border-focus data-[placeholder]:text-ink-faint aria-[invalid=true]:border-status-danger-indicator aria-[invalid=true]:focus-visible:border-status-danger-indicator",
      ]}
      bind:ref={triggerElement}
      type="button"
      id={resolvedId ?? undefined}
      data-part="trigger"
      data-placeholder={!value || displaysBookingPlaceholder || undefined}
      data-selected={selected || undefined}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-labelledby={formControl?.labelId}
      aria-busy={pending || undefined}
      aria-describedby={resolvedDescribedBy}
      aria-invalid={resolvedInvalid}
      aria-pressed={presentation === "booking" ? selected : undefined}
      data-required={resolvedRequired || undefined}
    >
      <svg
        class={[
          "w-control-icon h-control-icon flex-none",
          showDayNavigation && "compact-control:hidden",
        ]}
        data-part="calendar-icon"
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
      >
        <path
          d="M5 3v2M15 3v2M3.5 7.5h13M5 4h10a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 15 17H5a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 5 4Z"
        />
      </svg>
      <span class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{displayValue}</span>
    </Popover.Trigger>

    <Popover.Portal>
      <Popover.Content
        class="z-90 w-date-popover max-h-date-popover overflow-auto border border-line rounded-calendar-surface bg-surface p-md text-ink shadow-floating-surface outline-none"
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
      class="inline-flex min-w-0 min-h-date-trigger items-center justify-center border border-field-control-border rounded-control bg-field-control-surface p-0 font-body text-field-control-text cursor-pointer outline-none transition duration-120 enabled:hover:bg-surface-subtle focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-field-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      data-part="day-button"
      aria-label="Neste dag"
      disabled={nextDisabled}
      onclick={selectNextDay}
    >
      <svg
        class="w-control-icon h-control-icon flex-none"
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"><path d="m7.5 4.5 5 5.5-5 5.5" /></svg
      >
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
    <span class="sr-only" id={requiredDescriptionId} data-part="required-description"
      >Obligatorisk felt.</span
    >
  {/if}
</div>
