<script lang="ts" module>
  export type FormActionsAlign = "between" | "end" | "start";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    align?: FormActionsAlign;
    children?: Snippet;
    embedded?: boolean;
    fullWidth?: boolean;
  };

  let {
    align = "end",
    children,
    embedded = true,
    fullWidth = false,
    ...attributes
  }: Props = $props();
</script>

<div
  {...attributes}
  class={[
    "flex items-center gap-sm flex-wrap bg-form-actions-surface px-md pt-md pb-form-actions md:px-lg md:pt-form-actions-wide",
    "form-submit-control:w-full md:form-submit-content:w-auto md:form-submit-content:min-w-form-submit",
    embedded
      ? "border-0 border-t border-line rounded-none shadow-none"
      : "border border-line rounded-form-actions shadow-surface-sm",
    align === "start" ? "justify-start" : align === "between" ? "justify-between" : "justify-end",
    fullWidth && "w-full",
  ]}
  data-ui="form-actions"
  data-align={align}
  data-embedded={embedded ? "true" : undefined}
  data-full-width={fullWidth ? "true" : undefined}
>
  {@render children?.()}
</div>
