<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status} | Banebooking</title>
</svelte:head>

<main data-ui="route-error" role="alert">
  <p>{page.status}</p>
  <h1>Noe gikk galt</h1>
  <p>{page.error?.message ?? "En ukjent feil oppstod."}</p>
  <a href={resolve("/")}>Gå til forsiden</a>
</main>
