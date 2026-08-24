<script>
  let icon = [["path", { d: "M5 12h14", key: "line" }]];
  let iconRoot;
</script>

<svg bind:this={iconRoot}>
  {#each icon as [element, attributes] (attributes.key)}
    {@const { key: _key, class: _class, style: _style, ...elementAttributes } = attributes}
    <svelte:element this={element} {...elementAttributes} />
  {/each}
</svg>
