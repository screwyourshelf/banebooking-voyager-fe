<script lang="ts">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { getOptionalFormControlContext, mergeAriaIds } from "./form-control-context";

  type Props = Omit<
    HTMLTextareaAttributes,
    "aria-describedby" | "aria-invalid" | "id" | "required" | "value"
  > & {
    "aria-describedby"?: string | null;
    "aria-invalid"?: HTMLTextareaAttributes["aria-invalid"];
    id?: string | null;
    required?: boolean | null;
    value?: HTMLTextareaAttributes["value"];
  };

  let {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    id,
    required,
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

<textarea
  {...attributes}
  class="w-full min-w-0 min-h-textarea border border-line-strong rounded-textarea bg-field-surface p-md text-ink text-body-sm outline-none field-sizing-content resize-none transition duration-120 placeholder:text-ink-faint placeholder:opacity-100 focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-field-focus-ring aria-[invalid=true]:border-status-danger-indicator aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-field-invalid-ring aria-[invalid=true]:focus-visible:border-status-danger-indicator aria-[invalid=true]:focus-visible:ring-field-invalid-ring disabled:cursor-not-allowed disabled:opacity-50"
  bind:value
  id={resolvedId}
  required={resolvedRequired || undefined}
  aria-invalid={resolvedInvalid}
  aria-describedby={resolvedDescribedBy}
  data-ui-primitive="textarea"></textarea>
