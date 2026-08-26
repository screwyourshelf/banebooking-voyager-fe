<script>
  let dynamicElement = "div";
  let rawMarkup = '<div class="bg-red-500"></div>';
</script>

<svelte:element this={dynamicElement}></svelte:element>
<div {...{ class: "bg-surface", style: "color:red" }}></div>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html rawMarkup}
<div use:decorate></div>
<div {@attach decorate}></div>
<div animate:flip></div>
