<script>
  import { Page } from "$lib/ui";
  let computedClass = "bg-red-500";
  let rawMarkup = '<div class="bg-red-500" style="color:red"></div>';
  let semanticProps = { title: "Baner" };
</script>

<div class={computedClass}></div>
<svelte:element this="div" class={computedClass}></svelte:element>
<div {...{ class: "bg-red-500", style: "color:red" }}></div>
<Page {...semanticProps} />
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html rawMarkup}
<div use:decorate></div>
<div {@attach decorate}></div>
<div transition:fade></div>
<svelte:component this={Page} />
<svelte:head>
  <style>
    body {
      color: red;
    }
  </style>
  <link rel="stylesheet" href="/feature.css" />
</svelte:head>
