<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    setFormControlContext,
    type FormControlContext,
  } from "../primitives/form-control-context";
  import { isInsideFormFields } from "./form-fields-context";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    children: Snippet;
    controlId?: string;
    description?: string;
    error?: string | null;
    label: string;
    required?: boolean;
  };

  let {
    children,
    controlId,
    description,
    error,
    label,
    required = false,
    ...attributes
  }: Props = $props();

  if (!isInsideFormFields()) {
    throw new Error("FormField must be rendered inside FormFields.");
  }

  const generatedId = $props.id();
  const resolvedControlId = $derived(controlId ?? `${generatedId}-control`);
  const labelId = $derived(`${resolvedControlId}-label`);
  const descriptionId = $derived(description ? `${resolvedControlId}-description` : undefined);
  const errorId = $derived(error ? `${resolvedControlId}-error` : undefined);

  const formControlContext: FormControlContext = {
    get controlId() {
      return resolvedControlId;
    },
    get labelId() {
      return labelId;
    },
    get descriptionId() {
      return descriptionId;
    },
    get errorId() {
      return errorId;
    },
    get invalid() {
      return Boolean(error);
    },
    get required() {
      return required;
    },
  };

  setFormControlContext(formControlContext);
</script>

<div
  {...attributes}
  class="grid min-w-0 gap-form-field-gap p-form-field md:px-form-field-wide-inline md:py-lg"
  data-ui="form-field"
  data-invalid={error ? "true" : undefined}
>
  <div class="grid min-w-0 gap-form-field-intro" data-part="intro">
    <label
      class="inline-flex w-fit items-baseline gap-xs text-ink text-body-sm font-form-label leading-form-label"
      id={labelId}
      for={resolvedControlId}
      data-part="label"
    >
      {label}
      {#if required}
        <span class="text-status-danger-text" data-part="required" aria-hidden="true">*</span>
      {/if}
    </label>
    {#if description}
      <p
        class="m-0 text-ink-faint text-caption leading-form-supporting"
        id={descriptionId}
        data-part="description"
      >
        {description}
      </p>
    {/if}
  </div>
  <div
    class="grid min-w-0 gap-form-control form-field-control:w-full form-field-control:min-h-form-control"
    data-part="control"
  >
    {@render children()}
    {#if error}
      <p
        class="m-0 text-status-danger-text text-caption leading-form-supporting"
        id={errorId}
        data-part="error"
        role="alert"
      >
        {error}
      </p>
    {/if}
  </div>
</div>
