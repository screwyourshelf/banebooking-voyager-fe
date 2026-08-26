<script lang="ts">
  type IconAttributes = Record<string, string | number>;
  export type IconData = ReadonlyArray<readonly [string, IconAttributes]>;
  export type IconSize = "button" | "default";

  let { icon, size = "default" }: { icon: IconData; size?: IconSize } = $props();

  const dimension = $derived(size === "button" ? 20 : 16);
</script>

<svg
  class="flex-none"
  data-ui-primitive="icon"
  viewBox="0 0 24 24"
  width={dimension}
  height={dimension}
  fill="none"
  aria-hidden="true"
  focusable="false"
>
  {#each icon as [element, attributes] (attributes.key)}
    {@const { key: _key, class: _class, style: _style, ...elementAttributes } = attributes}
    <svelte:element this={element} {...elementAttributes} />
  {/each}
</svg>
