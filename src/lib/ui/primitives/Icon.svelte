<script lang="ts">
  type IconAttributes = Record<string, string | number>;
  export type IconData = ReadonlyArray<readonly [string, IconAttributes]>;

  let { icon }: { icon: IconData } = $props();
</script>

<svg data-ui-primitive="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
  {#each icon as [element, attributes] (attributes.key)}
    {@const { key: _key, ...elementAttributes } = attributes}
    <svelte:element this={element} {...elementAttributes} />
  {/each}
</svg>
