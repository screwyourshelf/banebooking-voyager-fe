<script>
  let { label, ...attributes } = $props();
</script>

<div {...attributes} aria-label={label}></div>
