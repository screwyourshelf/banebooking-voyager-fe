<script lang="ts" module>
  export type InputType = "email" | "number" | "password" | "search" | "tel" | "text" | "url";
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";

  type Props = Omit<
    HTMLInputAttributes,
    "aria-describedby" | "aria-invalid" | "id" | "required" | "value"
  > & {
    "aria-describedby"?: string | null;
    "aria-invalid"?: HTMLInputAttributes["aria-invalid"];
    id?: string | null;
    required?: boolean | null;
    type?: InputType;
    value?: HTMLInputAttributes["value"];
  };

  let {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    id,
    required,
    type = "text",
    value = $bindable(),
    ...attributes
  }: Props = $props();

  const formControl = getOptionalFormControlContext();
  const resolvedId = $derived(formControl?.controlId ?? id);
  const resolvedRequired = $derived(Boolean(required || formControl?.required));
  const resolvedInvalid = $derived(ariaInvalid ?? (formControl?.invalid ? "true" : undefined));
  const resolvedDescribedBy = $derived(
    mergeAriaIds(ariaDescribedBy, formControl?.descriptionId, formControl?.errorId)
  );
</script>

<input
  {...attributes}
  class={[
    "w-full min-w-0 border text-ink text-body-sm outline-none transition duration-120 placeholder:text-ink-faint placeholder:opacity-100 disabled:cursor-not-allowed disabled:opacity-50",
    type === "search"
      ? "h-search-control min-h-control border-line-strong rounded-control bg-surface px-search-control-inline py-sm shadow-surface-sm"
      : "border-line-strong rounded-control bg-field-surface px-md py-sm focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-field-focus-ring aria-[invalid=true]:border-status-danger-indicator aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-field-invalid-ring aria-[invalid=true]:focus-visible:border-status-danger-indicator aria-[invalid=true]:focus-visible:ring-field-invalid-ring",
    type !== "search" && (formControl ? "min-h-form-control" : "min-h-control"),
  ]}
  bind:value
  {type}
  id={resolvedId}
  required={resolvedRequired || undefined}
  aria-invalid={resolvedInvalid}
  aria-describedby={resolvedDescribedBy}
  data-ui-primitive="input"
/>
