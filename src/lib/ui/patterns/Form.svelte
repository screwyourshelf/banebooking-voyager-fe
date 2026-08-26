<script lang="ts" module>
  export type FormDensity = "compact" | "default";
  export type FormVariant = "default" | "editor";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLFormAttributes>, "children" | "novalidate"> & {
    children?: Snippet;
    density?: FormDensity;
    noValidate?: boolean;
    pending?: boolean;
    variant?: FormVariant;
  };

  let {
    children,
    density = "default",
    noValidate = true,
    pending = false,
    variant = "default",
    ...attributes
  }: Props = $props();
</script>

<form
  {...attributes}
  class={[
    "w-full",
    variant === "editor" ? "" : density === "compact" ? "space-y-xs" : "space-y-sm",
  ]}
  novalidate={noValidate}
  data-ui="form"
  data-density={density}
  data-variant={variant}
  aria-busy={pending || undefined}
>
  {@render children?.()}
</form>
