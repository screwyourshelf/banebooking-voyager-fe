<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { PublicHtmlAttributes } from "../public-html-attributes";

  type Props = Omit<PublicHtmlAttributes<HTMLAttributes<HTMLDivElement>>, "children"> & {
    children?: Snippet;
  };

  let { children, ...attributes }: Props = $props();
</script>

<div {...attributes} class="block border-0 rounded-none bg-transparent" data-ui="settings-panel">
  <div
    class="overflow-hidden text-body-sm settings-panel-row:border-t settings-panel-row:border-settings-row-divider"
    data-ui="row-list"
    data-divided="true"
    data-density="compact"
  >
    {@render children?.()}
  </div>
</div>
