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
  bind:value
  {type}
  id={resolvedId}
  required={resolvedRequired || undefined}
  aria-invalid={resolvedInvalid}
  aria-describedby={resolvedDescribedBy}
  data-ui-primitive="input"
/>
