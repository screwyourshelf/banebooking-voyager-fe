<script lang="ts">
  type Props = {
    eyebrow?: string;
    title: string;
    description: string;
  };

  let { eyebrow = "SvelteKit-fundament", title, description }: Props = $props();
</script>

<svelte:head>
  <title>{title} | Banebooking</title>
</svelte:head>

<main data-ui="route-placeholder">
  <p data-part="eyebrow">{eyebrow}</p>
  <h1 data-part="title">{title}</h1>
  <p data-part="description">{description}</p>
</main>

<style>
  [data-ui="route-placeholder"] {
    box-sizing: border-box;
    width: min(100% - 2rem, 48rem);
    margin: 3rem auto;
    padding: 2rem;
    border: 1px solid color-mix(in srgb, currentcolor 15%, transparent);
    border-radius: 1rem;
    background: Canvas;
    color: CanvasText;
    font-family: system-ui, sans-serif;
  }

  [data-ui="route-placeholder"] > [data-part="eyebrow"] {
    margin: 0 0 0.5rem;
    color: #287245;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  [data-ui="route-placeholder"] > [data-part="title"] {
    margin: 0;
    font-size: clamp(1.75rem, 5vw, 2.5rem);
  }

  [data-ui="route-placeholder"] > [data-part="description"] {
    margin: 0.75rem 0 0;
    line-height: 1.6;
  }
</style>
