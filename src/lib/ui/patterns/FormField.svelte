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

<div {...attributes} data-ui="form-field" data-invalid={error ? "true" : undefined}>
  <div data-part="intro">
    <label id={labelId} for={resolvedControlId} data-part="label">
      {label}
      {#if required}<span data-part="required" aria-hidden="true">*</span>{/if}
    </label>
    {#if description}<p id={descriptionId} data-part="description">{description}</p>{/if}
  </div>
  <div data-part="control">
    {@render children()}
    {#if error}<p id={errorId} data-part="error" role="alert">{error}</p>{/if}
  </div>
</div>
