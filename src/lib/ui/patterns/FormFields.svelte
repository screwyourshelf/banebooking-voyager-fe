<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { setFormFieldsContext } from "./form-fields-context";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & { children?: Snippet };

  let { children, ...attributes }: Props = $props();
  setFormFieldsContext({ name: "form-fields" });
</script>

<div
  {...attributes}
  class="grid min-w-0 bg-surface form-fields-flow:border-t form-fields-flow:border-line"
  data-ui="form-fields"
>
  {@render children?.()}
</div>
