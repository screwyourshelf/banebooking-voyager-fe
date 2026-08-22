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
    <BitsSelect.Value {placeholder} />
    <svg data-part="icon" aria-hidden="true" viewBox="0 0 20 20">
      <path d="m6.5 8 3.5 3.5L13.5 8" />
    </svg>
  </BitsSelect.Trigger>

  <BitsSelect.Portal>
    <BitsSelect.Content
      data-ui-primitive="select-content"
      id={contentId}
      aria-label={ariaLabel}
      aria-labelledby={formControl?.labelId}
      sideOffset={6}
      collisionPadding={8}
    >
      <BitsSelect.ScrollUpButton data-part="scroll-button" aria-label="Rull opp">
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m6.5 12 3.5-3.5 3.5 3.5" /></svg>
      </BitsSelect.ScrollUpButton>
      <BitsSelect.Viewport data-part="viewport">
        {#if options.length === 0}
          <div data-part="empty">{emptyLabel}</div>
        {:else}
          {#each options as option (option.value)}
            <BitsSelect.Item
              value={option.value}
              label={option.label}
              disabled={option.disabled}
              aria-disabled={option.disabled || undefined}
              data-part="item"
            >
              {#snippet children({ selected })}
                <span data-part="label">{option.label}</span>
                <span
                  data-part="indicator"
                  aria-hidden="true"
                  data-selected={selected || undefined}
                >
                  {#if selected}
                    <svg viewBox="0 0 20 20"><path d="m4.5 10 3.25 3.25L15.5 5.5" /></svg>
                  {/if}
                </span>
              {/snippet}
            </BitsSelect.Item>
          {/each}
        {/if}
      </BitsSelect.Viewport>
      <BitsSelect.ScrollDownButton data-part="scroll-button" aria-label="Rull ned">
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg>
      </BitsSelect.ScrollDownButton>
    </BitsSelect.Content>
  </BitsSelect.Portal>
</BitsSelect.Root>
