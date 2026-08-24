<script lang="ts" module>
  export type SelectOption<TValue extends string = string> = Readonly<{
    disabled?: boolean;
    label: string;
    value: TValue;
  }>;
</script>

<script lang="ts" generics="TValue extends string">
  import { Select as BitsSelect } from "bits-ui";
  import type { HTMLButtonAttributes, HTMLInputAttributes } from "svelte/elements";
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";

  type Props = {
    "aria-describedby"?: string | null;
    "aria-invalid"?: HTMLButtonAttributes["aria-invalid"];
    "aria-label"?: string;
    autocomplete?: HTMLInputAttributes["autocomplete"];
    disabled?: boolean;
    emptyLabel?: string;
    id?: string | null;
    name?: string;
    onValueChange?: (value: TValue) => void;
    options: readonly SelectOption<TValue>[];
    pending?: boolean;
    placeholder?: string;
    required?: boolean | null;
    value?: TValue;
  };

  let {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-label": ariaLabel,
    autocomplete,
    disabled = false,
    emptyLabel = "Ingen valg tilgjengelig",
    id,
    name,
    onValueChange,
    options,
    pending = false,
    placeholder = "Velg…",
    required,
    value = $bindable(),
  }: Props = $props();

  const formControl = getOptionalFormControlContext();
  const generatedId = $props.id();
  const contentId = `${generatedId}-listbox`;
  const resolvedId = $derived(formControl?.controlId ?? id);
  const resolvedRequired = $derived(Boolean(required || formControl?.required));
  const resolvedInvalid = $derived(ariaInvalid ?? (formControl?.invalid ? "true" : undefined));
  const resolvedDescribedBy = $derived(
    mergeAriaIds(ariaDescribedBy, formControl?.descriptionId, formControl?.errorId)
  );
  const isDisabled = $derived(disabled || pending);
  const rootItems = $derived(
    options.map(({ disabled: optionDisabled, label, value: optionValue }) => ({
      disabled: optionDisabled,
      label,
      value: optionValue,
    }))
  );

  function handleValueChange(nextValue: string) {
    value = nextValue as TValue;
    onValueChange?.(value);
  }
</script>

<BitsSelect.Root
  type="single"
  items={rootItems}
  {value}
  onValueChange={handleValueChange}
  disabled={isDisabled}
  required={resolvedRequired && Boolean(name)}
  {name}
  {autocomplete}
  loop
>
  <BitsSelect.Trigger
    class={[
      "group inline-flex min-w-control items-center justify-between gap-select-trigger-gap border border-field-control-border rounded-control bg-field-control-surface px-control-inline py-control-block font-body text-body-sm leading-control text-left cursor-pointer outline-none transition duration-120 focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-field-focus-ring aria-[invalid=true]:border-status-danger-indicator aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-field-invalid-ring aria-[invalid=true]:focus-visible:border-status-danger-indicator aria-[invalid=true]:focus-visible:ring-field-invalid-ring disabled:cursor-not-allowed disabled:opacity-50",
      formControl ? "min-h-form-control" : "min-h-select-trigger",
    ]}
    id={resolvedId ?? undefined}
    role="combobox"
    disabled={isDisabled}
    aria-label={ariaLabel}
    aria-labelledby={formControl?.labelId}
    aria-controls={contentId}
    aria-busy={pending || undefined}
    aria-describedby={resolvedDescribedBy}
    aria-invalid={resolvedInvalid}
    aria-required={resolvedRequired || undefined}
    data-ui-primitive="select-trigger"
  >
    <BitsSelect.Value
      class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap group-data-[placeholder]:text-ink-faint"
      {placeholder}
    />
    <svg
      class="w-control-icon h-control-icon flex-none"
      data-part="icon"
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.8"
    >
      <path d="m6.5 8 3.5 3.5L13.5 8" />
    </svg>
  </BitsSelect.Trigger>

  <BitsSelect.Portal>
    <BitsSelect.Content
      class="z-90 min-w-select-content max-w-select-content max-h-select-content overflow-hidden border border-line rounded-select-content bg-surface text-ink shadow-floating-surface"
      data-ui-primitive="select-content"
      id={contentId}
      aria-label={ariaLabel}
      aria-labelledby={formControl?.labelId}
      sideOffset={6}
      collisionPadding={8}
    >
      <BitsSelect.ScrollUpButton
        class="flex w-full min-h-select-scroll items-center justify-center border-0 bg-surface text-ink-faint"
        data-part="scroll-button"
        aria-label="Rull opp"
      >
        <svg
          class="w-control-icon h-control-icon"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"><path d="m6.5 12 3.5-3.5 3.5 3.5" /></svg
        >
      </BitsSelect.ScrollUpButton>
      <BitsSelect.Viewport class="max-h-select-viewport overflow-y-auto p-xs" data-part="viewport">
        {#if options.length === 0}
          <div class="p-md text-ink-faint text-body-sm" data-part="empty">{emptyLabel}</div>
        {:else}
          {#each options as option (option.value)}
            <BitsSelect.Item
              class="relative flex min-h-select-option items-center gap-select-trigger-gap rounded-choice py-select-option-block pr-select-option-indicator pl-control-inline font-body text-body-sm leading-select-option cursor-default outline-none select-none data-[highlighted]:bg-nav-active-surface data-[highlighted]:text-nav-active data-[disabled]:opacity-select-disabled"
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              aria-disabled={option.disabled || undefined}
              data-part="item"
            >
              {#snippet children({ selected })}
                <span class="min-w-0" data-part="label">{option.label}</span>
                <span
                  class="absolute right-md grid w-control-icon h-control-icon place-items-center text-choice-indicator"
                  data-part="indicator"
                  aria-hidden="true"
                  data-selected={selected || undefined}
                >
                  {#if selected}
                    <svg
                      class="w-control-icon h-control-icon"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"><path d="m4.5 10 3.25 3.25L15.5 5.5" /></svg
                    >
                  {/if}
                </span>
              {/snippet}
            </BitsSelect.Item>
          {/each}
        {/if}
      </BitsSelect.Viewport>
      <BitsSelect.ScrollDownButton
        class="flex w-full min-h-select-scroll items-center justify-center border-0 bg-surface text-ink-faint"
        data-part="scroll-button"
        aria-label="Rull ned"
      >
        <svg
          class="w-control-icon h-control-icon"
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg
        >
      </BitsSelect.ScrollDownButton>
    </BitsSelect.Content>
  </BitsSelect.Portal>
</BitsSelect.Root>
