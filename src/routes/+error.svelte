<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { ButtonLink, Feedback, Page } from "$lib/ui";
</script>

<svelte:head>
  <title>{page.status} | Banebooking</title>
</svelte:head>

{#snippet homeAction()}
  <ButtonLink href={resolve("/")}>Gå til forsiden</ButtonLink>
{/snippet}

<Page eyebrow={`Feil ${page.status}`} title="Noe gikk galt" standalone>
  <Feedback
    tone="danger"
    title="Siden kunne ikke vises"
    description={page.error?.message ?? "En ukjent feil oppstod."}
    action={homeAction}
  />
</Page>
