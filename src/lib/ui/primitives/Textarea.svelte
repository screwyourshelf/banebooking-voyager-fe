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
  bind:value
  id={resolvedId}
  required={resolvedRequired || undefined}
  aria-invalid={resolvedInvalid}
  aria-describedby={resolvedDescribedBy}
  data-ui-primitive="textarea"></textarea>
