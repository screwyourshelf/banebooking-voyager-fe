<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { ButtonLink, Feedback, Page } from "$lib/ui";

  const notFound = $derived(page.status === 404);
</script>

<svelte:head>
  <title>{notFound ? "Siden finnes ikke" : `Feil ${page.status}`} | Banebooking</title>
</svelte:head>

{#snippet homeAction()}
  <ButtonLink href={resolve("/")}>Gå til forsiden</ButtonLink>
{/snippet}

<Page
  eyebrow={`Feil ${page.status}`}
  title={notFound ? "Siden finnes ikke" : "Noe gikk galt"}
  standalone
>
  <Feedback
    tone="danger"
    title={notFound ? "Vi fant ikke siden du lette etter" : "Siden kunne ikke vises"}
    description={notFound
      ? "Kontroller adressen eller gå tilbake til forsiden."
      : (page.error?.message ?? "En ukjent feil oppstod.")}
    action={homeAction}
  />
</Page>
