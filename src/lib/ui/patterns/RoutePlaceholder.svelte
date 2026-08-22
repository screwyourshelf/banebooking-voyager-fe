<script lang="ts">
  import Page from "./Page.svelte";

  type Props = {
    description: string;
    eyebrow?: string;
    title: string;
  };

  let { description, eyebrow = "SvelteKit-fundament", title }: Props = $props();
</script>

<svelte:head>
  <title>{title} | Banebooking</title>
</svelte:head>

<Page {eyebrow} {title} {description} standalone />
