<script>
  let icon = [["path", { d: "M5 12h14", key: "line" }]];
</script>

<svg>
  {#each icon as [element, attributes] (attributes.key)}
    {@const { key: _key, ...elementAttributes } = attributes}
    <svelte:element this={element} {...elementAttributes} />
  {/each}
</svg>
