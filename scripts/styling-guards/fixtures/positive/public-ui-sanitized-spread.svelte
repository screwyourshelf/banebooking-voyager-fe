<script lang="ts">
  let sourceAttributes: Record<string, unknown> = $props();
  const { class: _class, style: _style, ...attributes } = sourceAttributes;
</script>

<div {...attributes}></div>
